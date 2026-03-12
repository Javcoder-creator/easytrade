// src/routes/promotions.js
const router = require('express').Router();
const Promotion = require('../models/Promotion');
const { authenticate, authorize } = require('../middleware/auth');
const { success, error } = require('../utils/response');

router.use(authenticate);

// GET /api/v1/promotions — Barcha aksiyalar
router.get('/', async (req, res) => {
  try {
    const promos = await Promotion.findAll();
    return success(res, promos);
  } catch (err) {
    return error(res, 'Aksiyalarni olishda xato', 500);
  }
});

// GET /api/v1/promotions/active — Faol aksiyalar (POS uchun)
router.get('/active', async (req, res) => {
  try {
    const promos = await Promotion.findActive();
    return success(res, promos);
  } catch (err) {
    return error(res, 'Faol aksiyalarni olishda xato', 500);
  }
});

// GET /api/v1/promotions/:id
router.get('/:id', async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return error(res, 'Aksiya topilmadi', 404);
    return success(res, promo);
  } catch (err) {
    return error(res, 'Xato yuz berdi', 500);
  }
});

// POST /api/v1/promotions — Yangi aksiya
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    const promo = await Promotion.create(req.body);
    return success(res, promo, 'Aksiya qo\'shildi', 201);
  } catch (err) {
    return error(res, 'Aksiya qo\'shishda xato: ' + err.message, 500);
  }
});

// PUT /api/v1/promotions/:id
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {
    const promo = await Promotion.update(req.params.id, req.body);
    return success(res, promo, 'Aksiya yangilandi');
  } catch (err) {
    return error(res, 'Yangilashda xato', 500);
  }
});

// DELETE /api/v1/promotions/:id
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    await Promotion.delete(req.params.id);
    return success(res, null, 'Aksiya o\'chirildi');
  } catch (err) {
    return error(res, 'O\'chirishda xato', 500);
  }
});

module.exports = router;