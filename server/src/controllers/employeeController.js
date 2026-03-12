// src/controllers/employeeController.js
const User = require('../models/User');
const { success, error } = require('../utils/response');

// GET /api/v1/employees
const getAll = async (req, res) => {
  try {
    const { role } = req.query;
    const employees = await User.findAll({ role });
    return success(res, employees);
  } catch (err) {
    return error(res, 'Xodimlarni olishda xato', 500);
  }
};

// GET /api/v1/employees/:id
const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'Xodim topilmadi', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

// POST /api/v1/employees
const create = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password) {
      return error(res, 'Ism, email va parol majburiy', 400);
    }
    const user = await User.create({ name, email, password, role, phone });
    return success(res, user, 'Xodim qo\'shildi', 201);
  } catch (err) {
    if (err.code === '23505') return error(res, 'Bu email allaqachon ro\'yxatdan o\'tgan', 409);
    return error(res, 'Xodim qo\'shishda xato: ' + err.message, 500);
  }
};

// PUT /api/v1/employees/:id
const update = async (req, res) => {
  try {
    const user = await User.update(req.params.id, req.body);
    if (!user) return error(res, 'Xodim topilmadi', 404);
    return success(res, user, 'Xodim yangilandi');
  } catch (err) {
    return error(res, 'Yangilashda xato', 500);
  }
};

// DELETE /api/v1/employees/:id
const remove = async (req, res) => {
  try {
    if (parseInt(req.params.id) === req.user.id) {
      return error(res, 'O\'zingizni o\'chira olmaysiz', 400);
    }
    await User.delete(req.params.id);
    return success(res, null, 'Xodim o\'chirildi');
  } catch (err) {
    return error(res, 'O\'chirishda xato', 500);
  }
};

module.exports = { getAll, getById, create, update, remove };