// database/migrate_promotions.js — Aksiyalar jadvali
require('dotenv').config();
const { db } = require('../src/config/database');

async function migrate() {
  console.log('🔄 Aksiyalar jadvali yaratilmoqda...');

  await db.schema.createTableIfNotExists('promotions', (t) => {
    t.increments('id').primary();
    t.string('name', 200).notNullable();
    t.text('description');
    t.enum('type', ['percent', 'fixed', 'bogo']).defaultTo('percent'); // percent=foiz, fixed=miqdor, bogo=1+1
    t.decimal('value', 10, 2).defaultTo(0); // chegirma qiymati
    t.decimal('min_amount', 12, 2).defaultTo(0); // minimal sotuv summasi
    t.timestamp('starts_at').nullable();
    t.timestamp('ends_at').nullable();
    t.boolean('is_active').defaultTo(true);
    t.timestamps(true, true);
  });
  console.log('  ✅ promotions jadvali');

  // Aksiya — tovar bog'liq (ixtiyoriy)
  await db.schema.createTableIfNotExists('promotion_products', (t) => {
    t.increments('id').primary();
    t.integer('promotion_id').notNullable().references('id').inTable('promotions').onDelete('CASCADE');
    t.integer('product_id').references('id').inTable('products').onDelete('CASCADE');
    t.unique(['promotion_id', 'product_id']);
  });
  console.log('  ✅ promotion_products jadvali');

  console.log('\n✅ Migratsiya tugadi!');
  await db.destroy();
}

migrate().catch((err) => { console.error('❌ Xato:', err); process.exit(1); });