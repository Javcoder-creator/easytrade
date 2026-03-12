// src/routes/index.js — Barcha routerlarni birlashtirish
const router = require('express').Router();

router.use('/auth',     require('./auth'));
router.use('/products', require('./products'));
router.use('/sales',    require('./sales'));

// Kelajakda qo'shiladigan routerlar:
 router.use('/customers',  require('./customers'));
 router.use('/inventory',  require('./inventory'));
 router.use('/reports',    require('./reports'));


module.exports = router;
