// src/controllers/customerController.js
const Customer = require('../models/Customer');
const { success, error, paginate } = require('../utils/response');

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const customers = await Customer.findAll({ page: parseInt(page), limit: parseInt(limit), search });
    const total = await Customer.count({ search });
    return paginate(res, customers, total, page, limit);
  } catch (err) {
    return error(res, 'Mijozlarni olishda xato', 500);
  }
};

const getById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return error(res, 'Mijoz topilmadi', 404);
    return success(res, customer);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

const create = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    return success(res, customer, 'Mijoz qo\'shildi', 201);
  } catch (err) {
    return error(res, 'Mijoz qo\'shishda xato', 500);
  }
};

const update = async (req, res) => {
  try {
    const customer = await Customer.update(req.params.id, req.body);
    if (!customer) return error(res, 'Mijoz topilmadi', 404);
    return success(res, customer, 'Mijoz yangilandi');
  } catch (err) {
    return error(res, 'Yangilashda xato', 500);
  }
};

const remove = async (req, res) => {
  try {
    await Customer.delete(req.params.id);
    return success(res, null, 'Mijoz o\'chirildi');
  } catch (err) {
    return error(res, 'O\'chirishda xato', 500);
  }
};

module.exports = { getAll, getById, create, update, remove };
