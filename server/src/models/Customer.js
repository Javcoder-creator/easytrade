// src/models/Customer.js
const { db } = require('../config/database');
const TABLE = 'customers';

const Customer = {
  async findAll({ page = 1, limit = 20, search = '' } = {}) {
    const q = db(TABLE).where({ is_active: true }).orderBy('name', 'asc').limit(limit).offset((page - 1) * limit);
    if (search) q.whereILike('name', `%${search}%`).orWhereILike('phone', `%${search}%`);
    return q;
  },
  async findById(id) {
    return db(TABLE).where({ id, is_active: true }).first();
  },
  async create(data) {
    const [customer] = await db(TABLE).insert(data).returning('*');
    return customer;
  },
  async update(id, data) {
    const [customer] = await db(TABLE).where({ id }).update({ ...data, updated_at: new Date() }).returning('*');
    return customer;
  },
  async delete(id) {
    return db(TABLE).where({ id }).update({ is_active: false });
  },
  async count({ search = '' } = {}) {
    const q = db(TABLE).where({ is_active: true }).count('id as total');
    if (search) q.whereILike('name', `%${search}%`);
    const [{ total }] = await q;
    return parseInt(total);
  },
};

module.exports = Customer;
