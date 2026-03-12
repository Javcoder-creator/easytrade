// src/models/User.js
const { db } = require('../config/database');
const bcrypt = require('bcryptjs');
const TABLE = 'users';

const User = {
  async create({ name, email, password, role = 'cashier', phone = null }) {
    const password_hash = await bcrypt.hash(password, 12);
    const [user] = await db(TABLE)
      .insert({ name, email, password_hash, role, phone })
      .returning(['id', 'name', 'email', 'role', 'phone', 'created_at']);
    return user;
  },
  async findByEmail(email) {
    return db(TABLE).where({ email, is_active: true }).first();
  },
  async findById(id) {
    return db(TABLE).where({ id, is_active: true })
      .select(['id', 'name', 'email', 'role', 'phone', 'created_at']).first();
  },
  async findAll({ page = 1, limit = 20, role = null } = {}) {
    const q = db(TABLE).where({ is_active: true })
      .select(['id', 'name', 'email', 'role', 'phone', 'created_at'])
      .orderBy('created_at', 'desc').limit(limit).offset((page - 1) * limit);
    if (role) q.where({ role });
    return q;
  },
  async verifyPassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  },
  async update(id, data) {
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 12);
      delete data.password;
    }
    const [user] = await db(TABLE).where({ id })
      .update({ ...data, updated_at: new Date() })
      .returning(['id', 'name', 'email', 'role', 'phone']);
    return user;
  },
  async delete(id) {
    return db(TABLE).where({ id }).update({ is_active: false });
  },
};

module.exports = User;
