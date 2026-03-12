// database/fix_missing_stock.js
// Omborda yozuvi yo'q tovarlarni tuzatish
require('dotenv').config();
const { db } = require('../src/config/database');

async function fix() {
  console.log('🔧 Yetishmayotgan stock yozuvlari tekshirilmoqda...\n');

  // warehouse_id = 1 da stock yozuvi yo'q tovarlarni topish
  const productsWithoutStock = await db('products')
    .where({ is_active: true })
    .whereNotExists(
      db('stock').where('stock.product_id', db.raw('products.id')).where('stock.warehouse_id', 1)
    )
    .select(['id', 'name']);

  if (productsWithoutStock.length === 0) {
    console.log('✅ Barcha tovarlar omborga bog\'langan. Muammo yo\'q!');
    await db.destroy();
    return;
  }

  console.log(`⚠️  ${productsWithoutStock.length} ta tovarda stock yozuvi yo'q:`);
  for (const p of productsWithoutStock) {
    console.log(`   - ${p.name} (id: ${p.id})`);
  }

  // Yetishmayotgan stock yozuvlarini qo'shish (quantity = 0)
  const inserts = productsWithoutStock.map((p) => ({
    product_id: p.id,
    warehouse_id: 1,
    quantity: 0,
  }));

  await db('stock').insert(inserts);
  console.log(`\n✅ ${inserts.length} ta tovar uchun stock yozuvi (0 ta) yaratildi!`);
  console.log('💡 Ombor sahifasida "Kirim qilish" orqali miqdor kiriting.\n');

  await db.destroy();
}

fix().catch((err) => {
  console.error('❌ Xato:', err.message);
  process.exit(1);
});
