// src/controllers/salesController.js
// POS - Sotuv operatsiyalari

const Joi = require('joi');
const { query, transaction } = require('../config/database');
const logger = require('../config/logger');

// ─── Sotuv raqam generatsiya ─────────────────────────────
const generateSaleNumber = () => {
  const now = new Date();
  const date = now.toISOString().slice(0,10).replace(/-/g,'');
  const time = now.getTime().toString().slice(-5);
  return `SL-${date}-${time}`;
};

// ─── POST /api/v1/sales ──────────────────────────────────
// Yangi sotuv yaratish — POS ning asosiy operatsiyasi
const createSale = async (req, res, next) => {
  try {
    const schema = Joi.object({
      customer_id:    Joi.number().integer().allow(null),
      warehouse_id:   Joi.number().integer().required(),
      items: Joi.array().items(Joi.object({
        product_id: Joi.number().integer().required(),
        quantity:   Joi.number().positive().required(),
        unit_price: Joi.number().min(0).required(),
        discount:   Joi.number().min(0).default(0)
      })).min(1).required(),
      discount:        Joi.number().min(0).default(0),
      paid:            Joi.number().min(0).required(),
      payment_method:  Joi.string().valid('cash','card','transfer','mixed').default('cash'),
      notes:           Joi.string().allow('', null)
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(422).json({ success: false, message: error.details[0].message });
    }

    const result = await transaction(async (client) => {
      // 1. Har bir tovar uchun ombor qoldig'ini tekshirish
      for (const item of value.items) {
        const stock = await client.query(
          'SELECT quantity FROM stock WHERE product_id = $1 AND warehouse_id = $2 FOR UPDATE',
          [item.product_id, value.warehouse_id]
        );

        if (stock.rows.length === 0 || stock.rows[0].quantity < item.quantity) {
          const prod = await client.query('SELECT name FROM products WHERE id = $1', [item.product_id]);
          throw {
            statusCode: 400,
            message: `"${prod.rows[0]?.name}" omborda yetarli emas.`
          };
        }
      }

      // 2. Jami hisoblash
      const subtotal = value.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price) - item.discount;
      }, 0);
      const total = subtotal - value.discount;
      const change = Math.max(0, value.paid - total);

      // 3. Sale yaratish
      const sale = await client.query(`
        INSERT INTO sales (
          sale_number, customer_id, user_id, warehouse_id,
          subtotal, discount, total, paid, change_amount, payment_method, notes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
        RETURNING *
      `, [
        generateSaleNumber(), value.customer_id, req.user.id, value.warehouse_id,
        subtotal, value.discount, total, value.paid, change, value.payment_method, value.notes
      ]);

      const saleId = sale.rows[0].id;

      // 4. Sale items qo'shish + ombor kamaytirish
      for (const item of value.items) {
        const itemTotal = (item.quantity * item.unit_price) - item.discount;

        await client.query(`
          INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, discount, total)
          VALUES ($1,$2,$3,$4,$5,$6)
        `, [saleId, item.product_id, item.quantity, item.unit_price, item.discount, itemTotal]);

        // Ombor kamaytirish
        await client.query(`
          UPDATE stock 
          SET quantity = quantity - $1, updated_at = NOW()
          WHERE product_id = $2 AND warehouse_id = $3
        `, [item.quantity, item.product_id, value.warehouse_id]);
      }

      // 5. Mijoz balansini yangilash (agar bog'langan bo'lsa)
      if (value.customer_id) {
        const bonusPoints = Math.floor(total / 10000); // Har 10,000 so'm uchun 1 ball
        await client.query(`
          UPDATE customers 
          SET total_purchases = total_purchases + $1,
              bonus_points = bonus_points + $2,
              updated_at = NOW()
          WHERE id = $3
        `, [total, bonusPoints, value.customer_id]);
      }

      // To'liq sotuv ma'lumotlarini qaytarish
      const fullSale = await client.query(`
        SELECT s.*, 
          u.name AS cashier_name,
          c.name AS customer_name, c.phone AS customer_phone,
          json_agg(json_build_object(
            'product_id', si.product_id,
            'product_name', p.name,
            'quantity', si.quantity,
            'unit_price', si.unit_price,
            'discount', si.discount,
            'total', si.total
          )) AS items
        FROM sales s
        LEFT JOIN users u ON u.id = s.user_id
        LEFT JOIN customers c ON c.id = s.customer_id
        LEFT JOIN sale_items si ON si.sale_id = s.id
        LEFT JOIN products p ON p.id = si.product_id
        WHERE s.id = $1
        GROUP BY s.id, u.name, c.name, c.phone
      `, [saleId]);

      return fullSale.rows[0];
    });

    logger.info(`💰 Yangi sotuv: #${result.sale_number}, jami: ${result.total} so'm`);

    res.status(201).json({
      success: true,
      message: 'Sotuv muvaffaqiyatli amalga oshirildi!',
      data: result
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

// ─── GET /api/v1/sales ───────────────────────────────────
const getSales = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      date_from, date_to,
      user_id, customer_id, warehouse_id,
      payment_method, status
    } = req.query;

    let conditions = [];
    let params = [];
    let idx = 1;

    if (date_from) { conditions.push(`s.created_at >= $${idx++}`); params.push(date_from); }
    if (date_to)   { conditions.push(`s.created_at <= $${idx++}`); params.push(date_to + ' 23:59:59'); }
    if (user_id)   { conditions.push(`s.user_id = $${idx++}`); params.push(user_id); }
    if (customer_id) { conditions.push(`s.customer_id = $${idx++}`); params.push(customer_id); }
    if (warehouse_id) { conditions.push(`s.warehouse_id = $${idx++}`); params.push(warehouse_id); }
    if (payment_method) { conditions.push(`s.payment_method = $${idx++}`); params.push(payment_method); }
    if (status) { conditions.push(`s.status = $${idx++}`); params.push(status); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const result = await query(`
      SELECT s.*, 
        u.name AS cashier_name,
        c.name AS customer_name,
        COUNT(si.id) AS items_count
      FROM sales s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN customers c ON c.id = s.customer_id
      LEFT JOIN sale_items si ON si.sale_id = s.id
      ${where}
      GROUP BY s.id, u.name, c.name
      ORDER BY s.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, params);

    const countResult = await query(`SELECT COUNT(*) FROM sales s ${where}`, params.slice(0,-2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total/limit) }
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/sales/:id ───────────────────────────────
const getSale = async (req, res, next) => {
  try {
    const result = await query(`
      SELECT s.*, 
        u.name AS cashier_name, u.email AS cashier_email,
        c.name AS customer_name, c.phone AS customer_phone,
        w.name AS warehouse_name,
        json_agg(json_build_object(
          'id', si.id, 'product_id', si.product_id,
          'product_name', p.name, 'barcode', p.barcode,
          'quantity', si.quantity, 'unit_price', si.unit_price,
          'discount', si.discount, 'total', si.total
        )) AS items
      FROM sales s
      LEFT JOIN users u ON u.id = s.user_id
      LEFT JOIN customers c ON c.id = s.customer_id
      LEFT JOIN warehouses w ON w.id = s.warehouse_id
      LEFT JOIN sale_items si ON si.sale_id = s.id
      LEFT JOIN products p ON p.id = si.product_id
      WHERE s.id = $1
      GROUP BY s.id, u.name, u.email, c.name, c.phone, w.name
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Sotuv topilmadi.' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/sales/stats/today ───────────────────────
const getTodayStats = async (req, res, next) => {
  try {
    const warehouseId = req.query.warehouse_id;
    let params = [];
    let warehouseFilter = '';
    if (warehouseId) {
      warehouseFilter = 'AND warehouse_id = $1';
      params.push(warehouseId);
    }

    const result = await query(`
      SELECT
        COUNT(*)                          AS total_sales,
        COALESCE(SUM(total), 0)           AS total_revenue,
        COALESCE(SUM(discount), 0)        AS total_discount,
        COALESCE(AVG(total), 0)           AS avg_sale,
        COUNT(CASE WHEN payment_method='cash'     THEN 1 END) AS cash_sales,
        COUNT(CASE WHEN payment_method='card'     THEN 1 END) AS card_sales,
        COUNT(CASE WHEN payment_method='transfer' THEN 1 END) AS transfer_sales
      FROM sales
      WHERE DATE(created_at) = CURRENT_DATE 
        AND status = 'completed'
        ${warehouseFilter}
    `, params);

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSale, getSales, getSale, getTodayStats };
