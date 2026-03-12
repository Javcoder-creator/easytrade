# 🛒 EasyTrade — Do'kon Avtomatlashtirish Tizimi

**Stack:** React 18 + Node.js/Express + PostgreSQL

## 🚀 Ishga Tushirish

### 1. Backend (Server)

```bash
cd server
cp .env.example .env       # .env faylini sozlang
npm install

# PostgreSQL bazasini yarating:
createdb easytrade

# Jadvallarni yarating:
npm run migrate

# Test ma'lumotlarini qo'shing:
npm run seed

# Serverni ishga tushiring:
npm run dev
```

### 2. Test qilish (API)

Server ishlayotganini tekshirish:
```
GET http://localhost:5000/health
```

Login:
```
POST http://localhost:5000/api/v1/auth/login
{
  "email": "admin@easytrade.uz",
  "password": "admin123"
}
```

## 📁 Loyiha Tuzilmasi

```
easytrade/
  server/
    src/
      app.js              ← Asosiy server
      config/
        database.js       ← PostgreSQL ulanish
        jwt.js            ← JWT konfiguratsiya
      controllers/        ← Biznes logikasi
      models/             ← Database modellari
      routes/             ← API endpointlari
      middleware/         ← Auth, validation, errors
      utils/              ← Helper funksiyalar
    database/
      migrate.js          ← Jadvallar yaratish
      seeds/seed.js       ← Test ma'lumotlari
  client/                 ← React frontend (keyingi bosqich)
```

## 🔑 Login ma'lumotlari (test)

| Role    | Email                    | Parol      |
|---------|--------------------------|------------|
| Admin   | admin@easytrade.uz       | admin123   |
| Menejer | manager@easytrade.uz     | manager123 |
| Kassir  | cashier@easytrade.uz     | cashier123 |
