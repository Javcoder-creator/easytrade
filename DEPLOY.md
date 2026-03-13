# EasyTrade — Deploy qilish (Render.com)

Bu qo‘llanmada loyihani **Render.com** da bepul (free tier) deploy qilish ketma-ketligi keltirilgan: PostgreSQL, backend (Node) va frontend (Vite/React).

---

## Tayyorgarlik

1. **GitHub** da akkaunt va loyiha repozitoriyasi.
2. **Render.com** da akkaunt: [https://render.com](https://render.com) → Sign Up (GitHub bilan bog‘lash oson).

---

## Usul 1: Render Blueprint (render.yaml) orqali — tavsiya etiladi

Loyiha ildizida `render.yaml` fayli bor. U **bitta marta** barcha servislarni (baza, backend, frontend) yaratadi.

### 1-qadam: Kodni GitHub ga yuboring

```bash
cd c:\Users\Javohir\OneDrive\Desktop\easytrade
git add .
git commit -m "Deploy uchun tayyor"
git push origin main
```

(Agar repo yaratilmagan bo‘lsa: GitHub da yangi repo oching, keyin `git remote add origin ...` va `git push -u origin main`.)

### 2-qadam: Render da Blueprint ulash

1. [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. GitHub repozitoriyangizni ulang (EasyTrade).
3. Render `render.yaml` ni topadi. **Apply** bosing.
4. Region: **Frankfurt** (yoki o‘zingizga qulay). **Create resources** bosing.

Natija: 3 ta resurs yaratiladi:

- **easytrade-db** — PostgreSQL (bepul)
- **easytrade-backend** — Node.js server
- **easytrade-frontend** — statik sayt (Vite build)

### 3-qadam: Backend URL ni aniqlash

1. **Dashboard** → **easytrade-backend** → oching.
2. Yuqorida ko‘rinadigan **URL** ni nusxalang, masalan:  
   `https://easytrade-backend.onrender.com`

### 4-qadam: Frontend da API manzilini sozlash

Frontend build paytida `VITE_API_URL` kerak — backend manzili + `/api/v1`.

1. **Dashboard** → **easytrade-frontend** → **Environment**.
2. **VITE_API_URL** qo‘shing yoki o‘zgartiring:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://easytrade-backend.onrender.com/api/v1`  
   (o‘zingizning backend URL ingizni yozing, oxirida `/api/v1` bo‘lsin.)
3. **Save** → **Manual Deploy** → **Deploy latest commit**.

Bundan keyin frontend yangi API manziliga so‘rov yuboradi.

### 5-qadam: Backend birinchi ishga tushishi

Backend `start:prod` (scripts/start.sh) orqali avtomatik migratsiya va kerak bo‘lsa seed ishlaydi. Birinchi deploy 1–2 daqiqa davom etishi mumkin.

- **Health check:** brauzerda `https://easytrade-backend.onrender.com/health` oching — `"status":"OK"` kelishi kerak.
- Agar xato bo‘lsa: **Logs** tabida xabarni ko‘ring (DB ulanish, env o‘zgaruvchilar).

### 6-qadam: Frontendni ochish

**easytrade-frontend** ning berilgan URL ini oching, masalan:  
`https://easytrade-frontend.onrender.com`  
— bu yerda ilova ishlashi kerak.

---

## Usul 2: Qo‘lda servis yaratish (Blueprint ishlamasa)

Agar `render.yaml` ishlamasa yoki boshqacha sozlash xohlasangiz, quyidagilarni ketma-ket qiling.

### 2.1. PostgreSQL

1. **New** → **PostgreSQL**.
2. **Name:** `easytrade-db`, **Region:** Frankfurt, **Create**.
3. **Info** → **Internal Database URL** ni nusxalang (keyin backend ga berasiz).

### 2.2. Backend (Web Service)

1. **New** → **Web Service**.
2. Repo: EasyTrade, **Root Directory:** `server`.
3. **Build:** `npm install`
4. **Start:** `npm run start:prod` (yoki `npm start` — faqat server, migratsiya qo‘lda).
5. **Environment:**
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (PostgreSQL dan nusxalangan Internal Database URL)
   - `JWT_SECRET` = (ixtiyoriy uzun random matn)
   - `JWT_REFRESH_SECRET` = (ixtiyoriy uzun random matn)
   - `CLIENT_URL` = (frontend URL, masalan `https://easytrade-frontend.onrender.com`)
6. **Create Web Service**. URL ni eslab qoling (masalan `https://easytrade-backend.onrender.com`).

### 2.3. Frontend (Static Site)

1. **New** → **Static Site**.
2. Repo: EasyTrade, **Root Directory:** `client`.
3. **Build:** `npm install && npm run build`
4. **Publish directory:** `dist`
5. **Environment:**
   - `VITE_API_URL` = `https://easytrade-backend.onrender.com/api/v1` (o‘zingizning backend URL)
6. **Create Static Site**.

### 2.4. Migratsiya (qo‘lda bo‘lsa)

Agar backend da `start:prod` o‘rniga `npm start` ishlatgan bo‘lsangiz, migratsiyani Render **Shell** orqali ishlatishingiz mumkin:

1. Backend servis → **Shell** tab.
2. `node database/migrate.js`  
   `node database/migrate_promotions.js`  
   (ixtiyoriy) `node database/seeds/seed.js`

---

## Muhim environment o‘zgaruvchilar

| O‘zgaruvchi | Qayerda | Qanday qiymat |
|-------------|---------|----------------|
| `DATABASE_URL` | Backend | Render PostgreSQL → Internal Database URL |
| `JWT_SECRET` | Backend | Uzun random matn (Render “Generate” ham beradi) |
| `JWT_REFRESH_SECRET` | Backend | Uzun random matn |
| `CLIENT_URL` | Backend | Frontend manzili, masalan `https://easytrade-frontend.onrender.com` |
| `VITE_API_URL` | Frontend | `https://YOUR-BACKEND-URL.onrender.com/api/v1` |

---

## Tez-tez uchraydigan muammolar

- **Backend 500 / DB xato**  
  `DATABASE_URL` to‘g‘ri va Render PostgreSQL ishlayotganini tekshiring. **Internal Database URL** ishlatilishi ma’qul.

- **Frontend “network error” / API ga ulanish yo‘q**  
  Frontend **Environment** da `VITE_API_URL` = `https://...onrender.com/api/v1` (oxirida `/api/v1`) bo‘lishi kerak. O‘zgartirgach **Redeploy** qiling.

- **CORS xato**  
  Backend da `CLIENT_URL` (yoki `CLIENT_URLS`) frontend manziliga teng bo‘lishi kerak, masalan `https://easytrade-frontend.onrender.com`.

- **Bepul rejimda server “uyqu” rejimi**  
  Render bepul planda ~15 daqiqa ishlov bermasa servis uyquga ketadi. Birinchi so‘rov 1–2 daqiqaga kechikishi mumkin.

---

## Xulosa

1. Kodni GitHub ga push qiling.
2. Render da Blueprint (render.yaml) yoki qo‘lda PostgreSQL + Backend + Frontend yarating.
3. Backend ga `DATABASE_URL`, `JWT_*`, `CLIENT_URL` bering.
4. Frontend ga `VITE_API_URL` = `https://backend-url.onrender.com/api/v1` bering va redeploy qiling.
5. Frontend URL ini brauzerda oching — ilova ishlashi kerak.

Boshqa platforma (Vercel, Railway va h.k.) xohlasangiz, alohida qisqa qo‘llanma yozish mumkin.
