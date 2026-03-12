// src/controllers/saleController.js
const Sale = require('../models/Sale');
const { success, error, paginate } = require('../utils/response');

// POST /api/v1/sales - Yangi sotuv
const create = async (req, res) => {
  try {
    const { customer_id, items, discount, payment_method } = req.body;
    
    if (!items || items.length === 0) {
      return error(res, 'Savat bo\'sh. Kamida 1 ta tovar kerak.', 400);
    }

    const sale = await Sale.create({
      customer_id,
      user_id: req.user.id, // Tokendan olingan kassir ID si
      items,
      discount,
      payment_method,
    });

    return success(res, sale, 'Sotuv muvaffaqiyatli amalga oshirildi', 201);
  } catch (err) {
    console.error('Sotuv xato:', err);
    return error(res, 'Sotuvda xato yuz berdi: ' + err.message, 500);
  }
};

// GET /api/v1/sales - Sotuvlar tarixi
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, from_date, to_date } = req.query;
    
    // Kassir faqat o'z sotuvlarini ko'radi, admin hammasini
    const user_id = req.user.role === 'cashier' ? req.user.id : null;
    
    const sales = await Sale.findAll({ page: parseInt(page), limit: parseInt(limit), from_date, to_date, user_id });
    return success(res, sales);
  } catch (err) {
    return error(res, 'Sotuvlarni olishda xato', 500);
  }
};

// GET /api/v1/sales/:id - Bitta sotuv tafsiloti
const getById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return error(res, 'Sotuv topilmadi', 404);
    return success(res, sale);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

// GET /api/v1/sales/report/daily - Kunlik hisobot
const dailyReport = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const report = await Sale.getDailyReport(date);
    return success(res, report);
  } catch (err) {
    return error(res, 'Hisobotda xato', 500);
  }
};

module.exports = { create, getAll, getById, dailyReport };
