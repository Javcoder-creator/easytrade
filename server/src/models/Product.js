// src/models/Product.js
const { db } = require('../config/database');
const TABLE = 'products';

const Product = {
  // Barcha tovarlar (qidiruv, filter, pagination bilan)
  async findAll({ page = 1, limit = 20, search = '', category_id = null, low_stock = false } = {}) {
    const q = db(TABLE)
      .leftJoin('categories', 'products.category_id', 'categories.id')
      .leftJoin('stock', 'products.id', 'stock.product_id')
      .where('products.is_active', true)
      .select([
        'products.id', 'products.barcode', 'products.name',
        'products.cost_price', 'products.sale_price', 'products.unit',
        'products.min_quantity', 'products.image_url', 'products.is_active',
        'categories.name as category_name',
        db.raw('COALESCE(stock.quantity, 0) as quantity'),
      ])
      .limit(limit).offset((page - 1) * limit)
      .orderBy('products.name');

    if (search) {
      q.where(function() {
        this.whereILike('products.name', `%${search}%`)
            .orWhereILike('products.barcode', `%${search}%`);
      });
    }
    if (category_id) q.where('products.category_id', category_id);
    if (low_stock) q.whereRaw('stock.quantity <= products.min_quantity');

    return q;
  },

  // ID bo'yicha topish
  async findById(id) {
    return db(TABLE).where({ id, is_active: true }).first();
  },

  // Barkod bo'yicha topish (POS uchun)
  async findByBarcode(barcode) {
    return db(TABLE)
      .leftJoin('stock', 'products.id', 'stock.product_id')
      .where({ 'products.barcode': barcode, 'products.is_active': true })
      .select(['products.*', db.raw('COALESCE(stock.quantity, 0) as quantity')])
      .first();
  },

  // Yangi tovar yaratish (stock jadvaliga ham avtomatik qo'shish)
  async create(data) {
    return db.transaction(async (trx) => {
      const { initial_quantity = 0, warehouse_id = 1, ...productData } = data;

      // 1. Tovarni yaratish
      const [product] = await trx(TABLE).insert(productData).returning('*');

      // 2. Omborga avtomatik qo'shish (0 yoki ko'rsatilgan miqdor bilan)
      await trx('stock').insert({
        product_id: product.id,
        warehouse_id,
        quantity: initial_quantity,
      });

      return product;
    });
  },

  // Tovarni yangilash
  async update(id, data) {
    const [product] = await db(TABLE).where({ id })
      .update({ ...data, updated_at: new Date() }).returning('*');
    return product;
  },

  // Soft delete
  async delete(id) {
    return db(TABLE).where({ id }).update({ is_active: false });
  },

  // Umumiy soni (pagination uchun)
  async count({ search = '', category_id = null } = {}) {
    const q = db(TABLE).where({ is_active: true }).count('id as total').first();
    if (search) q.whereILike('name', `%${search}%`);
    if (category_id) q.where({ category_id });
    const result = await q;
    return parseInt(result.total);
  },
};

module.exports = Product;
