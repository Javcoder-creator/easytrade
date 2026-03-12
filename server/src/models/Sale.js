// src/models/Sale.js
const { db } = require('../config/database');

const Sale = {
  // Yangi sotuv (tranzaksiya ichida)
  async create({ customer_id, user_id, warehouse_id = 1, items, discount = 0, payment_method = 'cash' }) {
    return db.transaction(async (trx) => {
      // 1. Umumiy summani hisoblash
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const grandTotal = total - discount;

      // 2. Sotuv hujjatini yaratish
      const [sale] = await trx('sales').insert({
        customer_id, user_id, warehouse_id,
        total: grandTotal, discount, payment_method, status: 'completed',
      }).returning('*');

      // 3. Sotuv elementlarini qo'shish
      const saleItems = items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
      }));
      await trx('sale_items').insert(saleItems);

      // 4. Ombor qoldiqlarini kamaytirish
      for (const item of items) {
        await trx('stock')
          .where({ product_id: item.product_id, warehouse_id })
          .decrement('quantity', item.quantity);
      }

      // 5. Mijoz balansini yangilash (agar mijoz tanlangan bo'lsa)
      if (customer_id) {
        await trx('customers')
          .where({ id: customer_id })
          .increment('total_purchases', grandTotal);
      }

      return sale;
    });
  },

  // Sotuvlar tarixi
  async findAll({ page = 1, limit = 20, from_date, to_date, user_id } = {}) {
    const q = db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('users', 'sales.user_id', 'users.id')
      .select([
        'sales.id', 'sales.total', 'sales.discount', 'sales.payment_method',
        'sales.status', 'sales.created_at',
        'customers.name as customer_name', 'customers.phone as customer_phone',
        'users.name as cashier_name',
      ])
      .orderBy('sales.created_at', 'desc')
      .limit(limit).offset((page - 1) * limit);

    if (from_date) q.where('sales.created_at', '>=', from_date);
    if (to_date) q.where('sales.created_at', '<=', to_date);
    if (user_id) q.where('sales.user_id', user_id);

    return q;
  },

  // ID bo'yicha topish (tafsilot)
  async findById(id) {
    const sale = await db('sales')
      .leftJoin('customers', 'sales.customer_id', 'customers.id')
      .join('users', 'sales.user_id', 'users.id')
      .where('sales.id', id)
      .select(['sales.*', 'customers.name as customer_name', 'users.name as cashier_name'])
      .first();

    if (sale) {
      sale.items = await db('sale_items')
        .join('products', 'sale_items.product_id', 'products.id')
        .where({ sale_id: id })
        .select(['sale_items.*', 'products.name', 'products.barcode', 'products.unit']);
    }

    return sale;
  },

  // Kunlik savdo hisoboti
  async getDailyReport(date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db('sales')
      .whereBetween('created_at', [startOfDay, endOfDay])
      .where({ status: 'completed' })
      .select([
        db.raw('COUNT(*) as total_sales'),
        db.raw('SUM(total) as total_revenue'),
        db.raw('AVG(total) as avg_sale'),
      ])
      .first();

    return result;
  },
};

module.exports = Sale;
