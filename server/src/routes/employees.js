// src/routes/employees.js
const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin')); // Faqat admin ko'radi

router.get('/',     getAll);
router.get('/:id',  getById);
router.post('/',    create);
router.put('/:id',  update);
router.delete('/:id', remove);

module.exports = router;