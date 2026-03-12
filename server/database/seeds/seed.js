// database/seeds/seed.js — Test ma'lumotlari
require('dotenv').config();
const { db } = require('../../src/config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Test ma\'lumotlari qo\'shilmoqda...\n');

  // 1. Kategoriyalar
  await db('categories').del();
  await db('categories').insert([
    { id: 1, name: 'Oziq-Ovqat', icon: '🍎', color: '#27ae60' },
    { id: 2, name: 'Ichimliklar', icon: '🥤', color: '#2980b9' },
    { id: 3, name: 'Tozalik', icon: '🧹', color: '#8e44ad' },
    { id: 4, name: 'Elektronika', icon: '📱', color: '#e74c3c' },
  ]);
  console.log('  ✅ Kategoriyalar qo\'shildi');

  // 2. Foydalanuvchilar
  await db('users').del();
  const adminHash    = await bcrypt.hash('admin123', 12);
  const managerHash  = await bcrypt.hash('manager123', 12);
  const cashierHash  = await bcrypt.hash('cashier123', 12);
  await db('users').insert([
    { id: 1, name: 'Admin',   email: 'admin@easytrade.uz',   password_hash: adminHash,   role: 'admin' },
    { id: 2, name: 'Menejer', email: 'manager@easytrade.uz', password_hash: managerHash, role: 'manager' },
    { id: 3, name: 'Kassir',  email: 'cashier@easytrade.uz', password_hash: cashierHash, role: 'cashier' },
  ]);
  console.log('  ✅ Foydalanuvchilar qo\'shildi');

  // 3. Ombor
  await db('warehouses').del();
  await db('warehouses').insert([
    { id: 1, name: 'Asosiy Ombor', address: 'Toshkent', manager_id: 2 },
  ]);
  console.log('  ✅ Ombor qo\'shildi');

  // 4. Tovarlar
  await db('products').del();
  await db('products').insert([
    { id: 1, barcode: '4780200810014', name: 'Non (loaf)',      category_id: 1, unit: 'dona', cost_price: 3000,  sale_price: 4000,  min_quantity: 10 },
    { id: 2, barcode: '4890003001560', name: 'Sut (1L)',        category_id: 1, unit: 'dona', cost_price: 8000,  sale_price: 10000, min_quantity: 5 },
    { id: 3, barcode: '4600000000001', name: 'Cola (0.5L)',     category_id: 2, unit: 'dona', cost_price: 5000,  sale_price: 7000,  min_quantity: 20 },
    { id: 4, barcode: '4600000000002', name: 'Mineral Suv 1L', category_id: 2, unit: 'dona', cost_price: 2500,  sale_price: 3500,  min_quantity: 30 },
    { id: 5, barcode: '4600000000003', name: 'Ariel (3kg)',     category_id: 3, unit: 'dona', cost_price: 45000, sale_price: 55000, min_quantity: 5 },
  ]);
  console.log('  ✅ Tovarlar qo\'shildi');

  // 5. Ombor qoldiqlari
  await db('stock').del();
  await db('stock').insert([
    { product_id: 1, warehouse_id: 1, quantity: 50 },
    { product_id: 2, warehouse_id: 1, quantity: 30 },
    { product_id: 3, warehouse_id: 1, quantity: 100 },
    { product_id: 4, warehouse_id: 1, quantity: 80 },
    { product_id: 5, warehouse_id: 1, quantity: 15 },
  ]);
  console.log('  ✅ Ombor qoldiqlari qo\'shildi');

  // 6. Mijozlar
  await db('customers').del();
  await db('customers').insert([
    { id: 1, name: 'Alisher Karimov', phone: '+998901234567', bonus_points: 150 },
    { id: 2, name: 'Malika Yusupova', phone: '+998931234567', bonus_points: 50 },
  ]);
  console.log('  ✅ Mijozlar qo\'shildi');

  console.log('\n✅ Test ma\'lumotlari muvaffaqiyatli qo\'shildi!');
  console.log('\n📋 Login ma\'lumotlari:');
  console.log('  Admin:   admin@easytrade.uz    / admin123');
  console.log('  Menejer: manager@easytrade.uz  / manager123');
  console.log('  Kassir:  cashier@easytrade.uz  / cashier123');

  await db.destroy();
}

seed().catch(err => {
  console.error('❌ Seed xatosi:', err);
  process.exit(1);
});
