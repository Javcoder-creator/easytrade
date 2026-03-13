# EasyTrade — Loyihani ishga tushirish

## Talablar

- **Node.js** 18 yoki yuqori
- **PostgreSQL** (mahalliy yoki masofaviy)
- **npm** yoki **yarn**

---

## 1-qadam: PostgreSQL tayyorlash

PostgreSQL ishlab turgan bo‘lishi kerak. Yangi ma’lumotlar bazasi yarating:

```bash
# PostgreSQL ga kirish (sizning tizimingizda qanday bo‘lsa)
psql -U postgres

# Bazani yaratish
CREATE DATABASE easytrade;
\q
```

---

## 2-qadam: Server (backend)

### 2.1. Papkaga kirish va dependency o‘rnatish

```bash
cd server
npm install
```

### 2.2. `.env` faylini yaratish

`server` papkasida `.env.example` dan nusxa oling va haqiqiy qiymatlarni kiriting:

```bash
# Windows (PowerShell)
copy .env.example .env

# Yoki qo‘lda .env yarating
```

`.env` ichida **albatta** quyidagilarni to‘g‘rilang:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` — PostgreSQL ma’lumotlaringiz
- `JWT_SECRET` va `JWT_REFRESH_SECRET` — ixtiyoriy uzun random matn (masalan: `mySuperSecretKey123!`)

### 2.3. Migratsiyalar va seed (birinchi marta)

```bash
npm run migrate
npm run seed
```

### 2.4. Serverni ishga tushirish

```bash
npm run dev
```

Muvaffaqiyatli bo‘lsa, terminalda ko‘rinadi: **EasyTrade Server ishga tushdi**, port **5000**.

---

## 3-qadam: Client (frontend)

Yangi terminal oching.

### 3.1. Papkaga kirish va dependency o‘rnatish

```bash
cd client
npm install
```

### 3.2. Frontendni ishga tushirish

```bash
npm run dev
```

Brauzerda **http://localhost:3000** ochiladi. Vite proxy tufayli `/api` so‘rovlari avtomatik **http://localhost:5000** ga yuboriladi.

---

## Tezkor xulosa

| Qayerda    | Buyruq        | Manzil            |
|-----------|----------------|-------------------|
| `server/` | `npm run dev`  | http://localhost:5000 |
| `client/` | `npm run dev`  | http://localhost:3000 |

1. Avval **server**ni ishga tushiring (5000).
2. Keyin **client**ni ishga tushiring (3000).
3. Brauzerda **http://localhost:3000** ni oching.

---

## Muammolar bo‘lsa

- **DB ulanish xato** — `.env` dagi `DB_*` qiymatlarini va PostgreSQL ishlayotganligini tekshiring.
- **CORS xato** — server `.env` da `CLIENT_URL=http://localhost:3000` bo‘lishi kerak.
- **404 / API javob bermayapti** — avval server (5000) ishlab turganiga ishonch hosil qiling.
