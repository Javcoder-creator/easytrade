// src/routes/sales.js
const router = require('express').Router();
const Joi = require('joi');
const { create, getAll, getById, dailyReport } = require('../controllers/saleController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Sotuv validatsiyasi
const saleSchema = Joi.object({
  customer_id:    Joi.number().integer().optional().allow(null),
  discount:       Joi.number().min(0).default(0),
  payment_method: Joi.string().valid('cash', 'card', 'uzcard', 'humo', 'transfer').default('cash'),
  items: Joi.array().items(Joi.object({
    product_id: Joi.number().integer().required(),
    quantity:   Joi.number().positive().required(),
    price:      Joi.number().positive().required(),
    discount:   Joi.number().min(0).default(0),
  })).min(1).required(),
});

router.use(authenticate);

router.get('/report/daily',  authorize('admin', 'manager'), dailyReport);
router.get('/',   getAll);
router.get('/:id', getById);
router.post('/',  validate(saleSchema), create);

module.exports = router;
