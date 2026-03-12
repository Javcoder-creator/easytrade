// src/controllers/productController.js
const Product = require('../models/Product');
const { success, error, paginate } = require('../utils/response');

// GET /api/v1/products
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', category_id, low_stock } = req.query;
    const products = await Product.findAll({ 
      page: parseInt(page), limit: parseInt(limit), 
      search, category_id, low_stock: low_stock === 'true'
    });
    const total = await Product.count({ search, category_id });
    return paginate(res, products, total, page, limit);
  } catch (err) {
    return error(res, 'Tovarlarni olishda xato', 500);
  }
};

// GET /api/v1/products/:id
const getById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return error(res, 'Tovar topilmadi', 404);
    return success(res, product);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

// GET /api/v1/products/barcode/:code
const getByBarcode = async (req, res) => {
  try {
    const product = await Product.findByBarcode(req.params.code);
    if (!product) return error(res, 'Bu barkodli tovar topilmadi', 404);
    return success(res, product);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
};

// POST /api/v1/products
const create = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    return success(res, product, 'Tovar qo\'shildi', 201);
  } catch (err) {
    if (err.code === '23505') return error(res, 'Bu barkod allaqachon mavjud', 409);
    return error(res, 'Tovar qo\'shishda xato', 500);
  }
};

// PUT /api/v1/products/:id
const update = async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    if (!product) return error(res, 'Tovar topilmadi', 404);
    return success(res, product, 'Tovar yangilandi');
  } catch (err) {
    return error(res, 'Tovarni yangilashda xato', 500);
  }
};

// DELETE /api/v1/products/:id
const remove = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    return success(res, null, 'Tovar o\'chirildi');
  } catch (err) {
    return error(res, 'Tovarni o\'chirishda xato', 500);
  }
};

module.exports = { getAll, getById, getByBarcode, create, update, remove };
