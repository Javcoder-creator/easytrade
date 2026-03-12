// src/models/Inventory.js
const { db } = require('../config/database');

const Inventory = {
  // Ombordagi barcha tovarlar qoldiqlari
  async findAll({ page = 1, limit = 20, search = '', warehouse_id = 1, low_stock = false } = {}) {
    const q = db('stock')
      .join('products', 'stock.product_id', 'products.id')
      .join('categories', 'products.category_id', 'categories.id')
      .join('warehouses', 'stock.warehouse_id', 'warehouses.id')
      .where('products.is_active', true)
      .where('stock.warehouse_id', warehouse_id)
      .select([
        'stock.id', 'stock.quantity', 'stock.updated_at',
        'products.id as product_id', 'products.name', 'products.barcode',
        'products.unit', 'products.min_quantity', 'products.cost_price', 'products.sale_price',
        'categories.name as category_name',
        'warehouses.name as warehouse_name',
      ])
      .orderBy('products.name')
      .limit(limit).offset((page - 1) * limit);

    if (search) {
      q.where(function () {
        this.whereILike('products.name', `%${search}%`)
          .orWhereILike('products.barcode', `%${search}%`);
      });
    }
    if (low_stock) q.whereRaw('stock.quantity <= products.min_quantity');

    return q;
  },

  // Ombor kirim (tovar qo'shish)
  async addStock({ product_id, warehouse_id = 1, quantity, user_id, note = '' }) {
    return db.transaction(async (trx) => {
      // 1. Qoldiqni yangilash
      const existing = await trx('stock').where({ product_id, warehouse_id }).first();
      if (existing) {
        await trx('stock')
          .where({ product_id, warehouse_id })
          .increment('quantity', quantity)
          .update({ updated_at: new Date() });
      } else {
        await trx('stock').insert({ product_id, warehouse_id, quantity });
      }

      // 2. Kirim tarixi (purchases jadvaliga)
      await trx('purchases').insert({
        product_id, warehouse_id, quantity, user_id,
        note, type: 'income',
      }).catch(() => {}); // purchases jadvali bo'lmasa o'tkazib yuborish

      return trx('stock').where({ product_id, warehouse_id }).first();
    });
  },

  // Ombor hisoboti
  async getStats(warehouse_id = 1) {
    const [stats] = await db('stock')
      .join('products', 'stock.product_id', 'products.id')
      .where('products.is_active', true)
      .where('stock.warehouse_id', warehouse_id)
      .select([
        db.raw('COUNT(*) as total_products'),
        db.raw('SUM(stock.quantity * products.cost_price) as total_value'),
        db.raw('SUM(CASE WHEN stock.quantity <= products.min_quantity THEN 1 ELSE 0 END) as low_stock_count'),
      ]);
    return stats;
  },

  // Omborlar ro'yxati
  async getWarehouses() {
    return db('warehouses').where({ is_active: true }).select('*');
  },
};

module.exports = Inventory;