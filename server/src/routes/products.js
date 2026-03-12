// src/routes/products.js
const router = require('express').Router();
const Joi = require('joi');
const { getAll, getById, getByBarcode, create, update, remove } = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Tovar yaratish/yangilash uchun validatsiya
const productSchema = Joi.object({
  barcode:    Joi.string().max(50).optional(),
  name:       Joi.string().min(2).max(200).required(),
  category_id:Joi.number().integer().required(),
  unit:       Joi.string().valid('dona', 'kg', 'litr', 'metr', 'juft').default('dona'),
  cost_price: Joi.number().positive().required(),
  sale_price: Joi.number().positive().required(),
  min_quantity: Joi.number().min(0).default(5),
  description: Joi.string().max(500).optional(),
});

// Barcha endpointlar autentifikatsiya talab qiladi
router.use(authenticate);

router.get('/',              getAll);
router.get('/barcode/:code', getByBarcode);
router.get('/:id',           getById);
router.post('/',   authorize('admin', 'manager'), validate(productSchema), create);
router.put('/:id', authorize('admin', 'manager'), update);
router.delete('/:id', authorize('admin'), remove);

module.exports = router;
