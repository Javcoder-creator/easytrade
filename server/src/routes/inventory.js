// src/routes/inventory.js
const router = require('express').Router();
const { getStock, addStock, getStats, getWarehouses } = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/',            getStock);
router.get('/stats',       getStats);
router.get('/warehouses',  getWarehouses);
router.post('/add', authorize('admin', 'manager'), addStock);

module.exports = router;
