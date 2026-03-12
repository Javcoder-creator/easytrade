// src/routes/reports.js
const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { db } = require('../config/database');
const { success, error } = require('../utils/response');

router.use(authenticate);
router.use(authorize('admin', 'manager'));

// GET /api/v1/reports/summary — Dashboard uchun umumiy statistika
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    // Bugungi sotuv
    const [todayStats] = await db('sales')
      .whereBetween('created_at', [today, tomorrow])
      .where({ status: 'completed' })
      .select([
        db.raw('COALESCE(COUNT(*), 0) as sales_count'),
        db.raw('COALESCE(SUM(total), 0) as total_revenue'),
      ]);

    // Jami tovarlar
    const [productCount] = await db('products').where({ is_active: true }).count('id as total');

    // Jami mijozlar
    const [customerCount] = await db('customers').where({ is_active: true }).count('id as total');

    // Kam qolgan tovarlar
    const [lowStockCount] = await db('stock')
      .join('products', 'stock.product_id', 'products.id')
      .whereRaw('stock.quantity <= products.min_quantity')
      .where('products.is_active', true)
      .count('stock.id as total');

    return success(res, {
      today_sales: parseInt(todayStats.sales_count),
      today_revenue: parseFloat(todayStats.total_revenue),
      total_products: parseInt(productCount.total),
      total_customers: parseInt(customerCount.total),
      low_stock_count: parseInt(lowStockCount.total),
    });
  } catch (err) {
    return error(res, 'Statistikani olishda xato: ' + err.message, 500);
  }
});

// GET /api/v1/reports/weekly — Haftalik sotuv grafigi
router.get('/weekly', async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);

      const [stat] = await db('sales')
        .whereBetween('created_at', [d, next])
        .where({ status: 'completed' })
        .select([
          db.raw('COALESCE(SUM(total), 0) as revenue'),
          db.raw('COALESCE(COUNT(*), 0) as count'),
        ]);

      const dayNames = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
      days.push({
        kun: dayNames[d.getDay()],
        sotuv: parseFloat(stat.revenue),
        soni: parseInt(stat.count),
      });
    }
    return success(res, days);
  } catch (err) {
    return error(res, 'Haftalik hisobotda xato: ' + err.message, 500);
  }
});

// GET /api/v1/reports/top-products — Eng ko'p sotiladigan tovarlar
router.get('/top-products', async (req, res) => {
  try {
    const products = await db('sale_items')
      .join('products', 'sale_items.product_id', 'products.id')
      .join('sales', 'sale_items.sale_id', 'sales.id')
      .where('sales.status', 'completed')
      .groupBy('products.id', 'products.name')
      .select([
        'products.id', 'products.name',
        db.raw('SUM(sale_items.quantity) as total_qty'),
        db.raw('SUM(sale_items.quantity * sale_items.price) as total_revenue'),
      ])
      .orderBy('total_qty', 'desc')
      .limit(10);

    return success(res, products);
  } catch (err) {
    return error(res, 'Top tovarlarni olishda xato: ' + err.message, 500);
  }
});

module.exports = router;

// GET /api/v1/reports/monthly — Oylik sotuv grafigi
router.get('/monthly', async (req, res) => {
  try {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setMonth(end.getMonth() + 1);

      const [stat] = await db('sales')
        .whereBetween('created_at', [d, end])
        .where({ status: 'completed' })
        .select([
          db.raw('COALESCE(SUM(total), 0) as revenue'),
          db.raw('COALESCE(COUNT(*), 0) as count'),
          db.raw('COALESCE(SUM(total - discount), 0) as net'),
        ]);

      // Xarajat: sale_items orqali tannarx hisoblash
      const [cost] = await db('sale_items')
        .join('sales', 'sale_items.sale_id', 'sales.id')
        .join('products', 'sale_items.product_id', 'products.id')
        .whereBetween('sales.created_at', [d, end])
        .where('sales.status', 'completed')
        .select([db.raw('COALESCE(SUM(sale_items.quantity * products.cost_price), 0) as total_cost')]);

      const oylar = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      months.push({
        oy: oylar[d.getMonth()],
        daromad: parseFloat(stat.revenue),
        xarajat: parseFloat(cost.total_cost),
        foyda: parseFloat(stat.revenue) - parseFloat(cost.total_cost),
        soni: parseInt(stat.count),
      });
    }
    return success(res, months);
  } catch (err) {
    return error(res, 'Oylik hisobotda xato: ' + err.message, 500);
  }
});

// GET /api/v1/reports/payment-methods — To'lov usullari statistikasi
router.get('/payment-methods', async (req, res) => {
  try {
    const stats = await db('sales')
      .where({ status: 'completed' })
      .groupBy('payment_method')
      .select([
        'payment_method',
        db.raw('COUNT(*) as count'),
        db.raw('SUM(total) as total'),
      ]);
    return success(res, stats);
  } catch (err) {
    return error(res, 'To\'lov usullari statistikasida xato: ' + err.message, 500);
  }
});

// GET /api/v1/reports/cashier-stats — Kassirlar statistikasi
router.get('/cashier-stats', async (req, res) => {
  try {
    const stats = await db('sales')
      .join('users', 'sales.user_id', 'users.id')
      .where('sales.status', 'completed')
      .groupBy('users.id', 'users.name')
      .select([
        'users.name',
        db.raw('COUNT(sales.id) as sales_count'),
        db.raw('SUM(sales.total) as total_revenue'),
      ])
      .orderBy('total_revenue', 'desc');
    return success(res, stats);
  } catch (err) {
    return error(res, 'Kassir statistikasida xato: ' + err.message, 500);
  }
});

module.exports = router;
