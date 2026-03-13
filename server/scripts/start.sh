#!/bin/bash
set -e

echo "🔄 Migratsiyalar ishga tushirilmoqda..."
node database/migrate.js
node database/migrate_promotions.js

echo "🌱 Seed ma'lumotlari tekshirilmoqda..."
node -e "
const { db } = require('./src/config/database');
db('users').count('id as c').first().then(r => {
  if (parseInt(r.c) === 0) {
    console.log('Seed qilinmoqda...');
    const seed = require('./database/seeds/seed.js');
    setTimeout(() => db.destroy(), 5000);
  } else {
    console.log('Ma\'lumotlar bor, seed o\'tkazib yuborildi');
    db.destroy();
  }
}).catch(() => db.destroy());
"

echo "Server ishga tushirilmoqda..."
node src/app.js
