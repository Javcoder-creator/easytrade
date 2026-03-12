// src/config/database.js
const knex = require('knex');
require('dotenv').config();

// Render.com DATABASE_URL ni qo'llab-quvvatlash
const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Render SSL talab qiladi
    }
  : {
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || 'easytrade_db',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres123',
    };

const db = knex({
  client: 'pg',
  connection,
  pool: { min: 2, max: 10, acquireTimeoutMillis: 30000 },
  debug: process.env.NODE_ENV === 'development',
});

async function testConnection() {
  try {
    await db.raw('SELECT 1+1 AS result');
    console.log('✅ PostgreSQL ulanish muvaffaqiyatli');
  } catch (err) {
    console.error('❌ PostgreSQL ulanishda xato:', err.message);
    process.exit(1);
  }
}

module.exports = { db, testConnection };
