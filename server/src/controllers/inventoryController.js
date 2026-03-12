// src/controllers/inventoryController.js
const Inventory = require('../models/Inventory');
const { success, error, paginate } = require('../utils/response');

// GET /api/v1/inventory — Ombor qoldiqlari
const getStock = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', warehouse_id = 1, low_stock } = req.query;
    const items = await Inventory.findAll({
      page: parseInt(page), limit: parseInt(limit),
      search, warehouse_id: parseInt(warehouse_id),
      low_stock: low_stock === 'true',
    });
    return success(res, items);
  } catch (err) {
    return error(res, 'Ombor ma\'lumotlarini olishda xato: ' + err.message, 500);
  }
};

// POST /api/v1/inventory/add — Kirim qilish
const addStock = async (req, res) => {
  try {
    const { product_id, warehouse_id = 1, quantity, note } = req.body;
    if (!product_id || !quantity || quantity <= 0) {
      return error(res, 'Tovar va miqdor kiritilishi shart', 400);
    }
    const stock = await Inventory.addStock({
      product_id, warehouse_id, quantity: parseFloat(quantity),
      user_id: req.user.id, note,
    });
    return success(res, stock, `${quantity} ta tovar omborga kiritildi`, 201);
  } catch (err) {
    return error(res, 'Kirim qilishda xato: ' + err.message, 500);
  }
};

// GET /api/v1/inventory/stats — Ombor statistikasi
const getStats = async (req, res) => {
  try {
    const { warehouse_id = 1 } = req.query;
    const stats = await Inventory.getStats(parseInt(warehouse_id));
    return success(res, stats);
  } catch (err) {
    return error(res, 'Statistikani olishda xato', 500);
  }
};

// GET /api/v1/inventory/warehouses — Omborlar
const getWarehouses = async (req, res) => {
  try {
    const warehouses = await Inventory.getWarehouses();
    return success(res, warehouses);
  } catch (err) {
    return error(res, 'Omborlarni olishda xato', 500);
  }
};

module.exports = { getStock, addStock, getStats, getWarehouses };