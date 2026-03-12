// src/models/Promotion.js
const { db } = require('../config/database');
const TABLE = 'promotions';

const Promotion = {
  async findAll() {
    return db(TABLE).orderBy('created_at', 'desc');
  },

  async findActive() {
    const now = new Date();
    return db(TABLE)
      .where({ is_active: true })
      .where(function () {
        this.whereNull('starts_at').orWhere('starts_at', '<=', now);
      })
      .where(function () {
        this.whereNull('ends_at').orWhere('ends_at', '>=', now);
      });
  },

  async findById(id) {
    const promo = await db(TABLE).where({ id }).first();
    if (promo) {
      promo.products = await db('promotion_products')
        .join('products', 'promotion_products.product_id', 'products.id')
        .where({ promotion_id: id })
        .select(['products.id', 'products.name']);
    }
    return promo;
  },

  async create(data) {
    const [promo] = await db(TABLE).insert(data).returning('*');
    return promo;
  },

  async update(id, data) {
    const [promo] = await db(TABLE).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return promo;
  },

  async delete(id) {
    return db(TABLE).where({ id }).update({ is_active: false });
  },

  // Sotuvga chegirma hisoblash
  calculateDiscount(promotion, total) {
    if (!promotion) return 0;
    if (total < promotion.min_amount) return 0;
    if (promotion.type === 'percent') return total * (promotion.value / 100);
    if (promotion.type === 'fixed') return Math.min(promotion.value, total);
    return 0;
  },
};

module.exports = Promotion;