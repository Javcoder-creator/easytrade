// database/migrate.js — Ma'lumotlar bazasi jadvallari yaratish
require('dotenv').config();
const { db } = require('../src/config/database');

async function migrate() {
  console.log('🔄 Migratsiya boshlanmoqda...\n');

  // 1. Kategoriyalar
  await db.schema.createTableIfNotExists('categories', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.integer('parent_id').references('id').inTable('categories').onDelete('SET NULL');
    t.string('icon', 50).defaultTo('📦');
    t.string('color', 7).defaultTo('#3498db');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ categories jadvali');

  // 2. Foydalanuvchilar (xodimlar)
  await db.schema.createTableIfNotExists('users', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('email', 150).notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('phone', 20);
    t.enum('role', ['admin', 'manager', 'cashier']).defaultTo('cashier');
    t.boolean('is_active').defaultTo(true);
    t.timestamp('last_login');
    t.timestamps(true, true);
  });
  console.log('  ✅ users jadvali');

  // 3. Omborlar
  await db.schema.createTableIfNotExists('warehouses', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('address');
    t.integer('manager_id').references('id').inTable('users').onDelete('SET NULL');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ warehouses jadvali');

  // 4. Tovarlar
  await db.schema.createTableIfNotExists('products', (t) => {
    t.increments('id').primary();
    t.string('barcode', 50).unique();
    t.string('name', 200).notNullable();
    t.integer('category_id').references('id').inTable('categories').onDelete('SET NULL');
    t.string('unit', 20).defaultTo('dona');
    t.decimal('cost_price', 12, 2).defaultTo(0);
    t.decimal('sale_price', 12, 2).notNullable();
    t.integer('min_quantity').defaultTo(5); // Kam qolganda ogohlantirish
    t.text('description');
    t.string('image_url');
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ products jadvali');

  // 5. Ombor qoldiqlari
  await db.schema.createTableIfNotExists('stock', (t) => {
    t.increments('id').primary();
    t.integer('product_id').notNullable().references('id').inTable('products').onDelete('CASCADE');
    t.integer('warehouse_id').notNullable().references('id').inTable('warehouses').onDelete('CASCADE');
    t.decimal('quantity', 12, 3).defaultTo(0);
    t.unique(['product_id', 'warehouse_id']); // Har bir omborда har bir tovar 1 marta
    t.timestamps(true, true);
  });
  console.log('  ✅ stock jadvali');

  // 6. Mijozlar
  await db.schema.createTableIfNotExists('customers', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('phone', 20);
    t.string('address');
    t.decimal('balance', 12, 2).defaultTo(0); // Qarz/avans
    t.decimal('bonus_points', 10, 2).defaultTo(0);
    t.decimal('total_purchases', 14, 2).defaultTo(0);
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ customers jadvali');

  // 7. Sotuvlar
  await db.schema.createTableIfNotExists('sales', (t) => {
    t.increments('id').primary();
    t.integer('customer_id').references('id').inTable('customers').onDelete('SET NULL');
    t.integer('user_id').notNullable().references('id').inTable('users');
    t.integer('warehouse_id').notNullable().references('id').inTable('warehouses');
    t.decimal('total', 14, 2).notNullable();
    t.decimal('discount', 12, 2).defaultTo(0);
    t.enum('payment_method', ['cash', 'card', 'uzcard', 'humo', 'transfer']).defaultTo('cash');
    t.enum('status', ['completed', 'refunded', 'pending']).defaultTo('completed');
    t.text('note');
    t.timestamps(true, true);
  });
  console.log('  ✅ sales jadvali');

  // 8. Sotuv elementlari
  await db.schema.createTableIfNotExists('sale_items', (t) => {
    t.increments('id').primary();
    t.integer('sale_id').notNullable().references('id').inTable('sales').onDelete('CASCADE');
    t.integer('product_id').notNullable().references('id').inTable('products');
    t.decimal('quantity', 12, 3).notNullable();
    t.decimal('price', 12, 2).notNullable();
    t.decimal('discount', 10, 2).defaultTo(0);
  });
  console.log('  ✅ sale_items jadvali');

  // 9. Ta'minotchilar
  await db.schema.createTableIfNotExists('suppliers', (t) => {
    t.increments('id').primary();
    t.string('name', 100).notNullable();
    t.string('phone', 20);
    t.string('email', 150);
    t.decimal('balance', 12, 2).defaultTo(0);
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ suppliers jadvali');

  console.log('\n✅ Barcha jadvallar muvaffaqiyatli yaratildi!');
  await db.destroy();
}

migrate().catch(err => {
  console.error('❌ Migratsiya xatosi:', err);
  process.exit(1);
});
