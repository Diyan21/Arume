# ☕ Arume Coffee - Production-Ready REST API (`arume-api`)

Backend REST API produksi untuk website Arume Coffee berbasis **Node.js**, **Express.js**, **Supabase PostgreSQL**, dan **Duitku Payment Gateway**.

---

## 📁 Struktur Folder Project

```text
arume-api/
│
├── server.js               # Entry point Express.js server
├── package.json            # Node.js dependencies & npm scripts
├── .env.example            # Template Environment Variables
├── .gitignore              # Ignored files (node_modules, .env, dll)
├── README.md               # Dokumentasi lengkap & instruksi deployment
│
├── config/
│   ├── supabase.js         # Inisialisasi Supabase client & fallback detector
│   └── duitku.js           # Konfigurasi Duitku API & signature generator (MD5)
│
├── routes/
│   ├── products.js         # Routes produk (/api/products)
│   ├── orders.js           # Routes order (/api/orders)
│   ├── payment.js          # Routes pembayaran Duitku (/api/payment)
│   └── webhook.js          # Routes webhook callback Duitku (/api/webhook)
│
├── controllers/
│   ├── productController.js # Logika penanganan produk & seed data
│   ├── orderController.js   # Logika pembuatan order, validasi harga DB, order_number
│   └── paymentController.js # Logika transaksi Duitku, webhook callback, idempotency
│
├── middleware/
│   ├── errorHandler.js     # Express global error handler & 404 handler
│   └── validate.js         # Middleware validasi input pesanan & pembayaran
│
└── utils/
    └── response.js         # Standardized JSON response helper (success & error)
```

---

## 🛠️ Requirements & Panduan Lokal

### 1. Install Node.js
Pastikan Node.js (versi v18 LTS atau lebih baru) sudah ter-install di komputer Anda.
Cek versi Node.js dengan perintah:
```bash
node -v
npm -v
```

### 2. Jalankan Perintah Local Development
Clone atau download repository ini, lalu masuk ke direktori project:
```bash
cd arume-api

# Install seluruh dependencies
npm install

# Jalankan server dalam mode development
npm run dev
```
Server akan berjalan di `http://localhost:3000`.

### 3. Cara Membuat File `.env`
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka `.env` dan isi variabel dengan credential asli Anda.

---

## 🗄️ Panduan Supabase Database

### 4. Cara Membuat Database Supabase
1. Buka [https://supabase.com](https://supabase.com) dan login / register account.
2. Klik **New Project**.
3. Isi nama project: `arume-coffee-db`, pilih region terdekat (misal: Singapore), dan buat database password.
4. Klik **Create new project** dan tunggu proses provisioning selesai (~1 menit).

### 5. Cara Jalankan Script SQL di Supabase
1. Masuk ke dashboard Supabase project Anda.
2. Buka menu **SQL Editor** di sidebar kiri.
3. Klik **New Query**.
4. Copy-paste seluruh isi SQL Script berikut (atau dari tab Supabase SQL di aplikasi):

```sql
-- ==================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ARUME COFFEE
-- ==================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  total_amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal INTEGER NOT NULL
);

-- 6. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  merchant_order_id VARCHAR(100) UNIQUE NOT NULL,
  reference VARCHAR(255),
  payment_method VARCHAR(50),
  amount INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  payment_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_order_id ON payments(merchant_order_id);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SEED MENU ARUME COFFEE
INSERT INTO products (id, name, description, price, image_url, is_active)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kopi Gula Aren', 'Espresso dengan susu segar dan gula aren asli yang gurih nan manis.', 15000, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Kopi Butterscotch', 'Paduan espresso, cream butterscotch aromatik, dan susu pilihan.', 18000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Kopi Hazelnut', 'Aroma hazelnut nan lembut berpadu serasi dengan espresso khas Arume.', 18000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Kopi Banana Latte', 'Sensasi rasa pisang manis lembut berpadu sempurna dengan iced latte.', 18000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Americano', 'Double shot espresso murni tanpa gula, segar dan kaya rasa.', 10000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;
```
5. Klik **Run** (Ctrl+Enter) sampai muncul pesan `Success. No rows returned`.

### 6 & 7. Cara Mendapatkan Credentials Supabase
1. Di Supabase Dashboard, masuk ke **Project Settings** -> **API**.
2. **`SUPABASE_URL`**: Salin nilai di bawah bagian **Project URL**.
3. **`SUPABASE_SERVICE_ROLE_KEY`**: Salin nilai dari kolom **`service_role` (secret)**.
> ⚠️ **PERHATIAN:** `service_role` key memiliki akses Penuh. Jangan pernah kirim key ini ke frontend!

---

## 💳 Panduan Duitku Payment Gateway

### 8. Cara Mendapatkan Credential Duitku
1. Login ke akun [Duitku Merchant Portal](https://passport.duitku.com) (atau Sandbox di [https://sandbox.duitku.com](https://sandbox.duitku.com)).
2. Buka menu **My Merchant** -> **Projects**.
3. Ambil nilai berikut:
   - **`DUITKU_MERCHANT_CODE`**: Kode Merchant Anda (contoh: `D12345`).
   - **`DUITKU_API_KEY`**: Secret API Key milik Merchant Anda.
4. Set Callback URL & Return URL:
   - **`DUITKU_CALLBACK_URL`**: `https://arume-api.onrender.com/api/payment/callback`
   - **`DUITKU_RETURN_URL`**: `https://arume-coffee.netlify.app/order-status`
   - **`DUITKU_ENVIRONMENT`**: `sandbox` (atau `production` jika sudah live).

---

## 🚀 Panduan GitHub & Deploy ke Render

### 9. Upload Repository ke GitHub (`arume-api`)
```bash
git init
git add .
git commit -m "feat: initial release arume-api production backend"
git branch -M main
git remote add origin https://github.com/USERNAME/arume-api.git
git push -u origin main
```

### 10 - 13. Deploy ke Render.com
1. Login ke [https://render.com](https://render.com)
2. Klik **New +** -> **Web Service**.
3. Hubungkan akun GitHub Anda dan pilih repository **`arume-api`**.
4. Isi konfigurasi Web Service:
   - **Name:** `arume-api`
   - **Region:** Singapore (atau terdekat)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** (biarkan kosong atau `npm install`)
   - **Start Command:** `node server.js`
5. Buka bagian **Environment Variables** di Render dan masukkan variabel berikut:

| Key | Value Contoh |
| :--- | :--- |
| `PORT` | `3000` |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJKV1QiLC...` |
| `DUITKU_MERCHANT_CODE` | `D12345` |
| `DUITKU_API_KEY` | `your_duitku_api_key` |
| `DUITKU_CALLBACK_URL` | `https://arume-api.onrender.com/api/payment/callback` |
| `DUITKU_RETURN_URL` | `https://arume-coffee.netlify.app/order-status` |
| `DUITKU_ENVIRONMENT` | `sandbox` |
| `FRONTEND_URL` | `https://arume-coffee.netlify.app` |

6. Klik **Create Web Service**. Setelah build selesai, backend Anda aktif di URL seperti:
   `https://arume-api.onrender.com`

---

## 🌐 Menghubungkan Frontend Netlify ke Backend Render

Pada frontend React + Vite Arume Coffee Anda di Netlify, simpan URL Render di `.env` frontend:

```env
VITE_API_URL=https://arume-api.onrender.com
```

Lakukan fetch API dari frontend ke backend:
```javascript
// Contoh ambil produk
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
const data = await res.json();

// Contoh kirim order
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    customer: { name: 'Diyan', whatsapp: '087881227088' },
    items: [{ product_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', quantity: 2 }]
  })
});
```

---

## 📝 API Endpoints Summary

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Cek status kesehatan server API |
| `GET` | `/api/products` | Mengambil seluruh produk aktif |
| `GET` | `/api/products/:id` | Mengambil detail 1 produk berdasarkan ID |
| `POST` | `/api/orders` | Membuat pesanan baru (Harga dihitung di backend) |
| `GET` | `/api/orders/:orderNumber` | Mengambil detail pesanan & status pembayaran |
| `POST` | `/api/payment/create` | Membuat URL transaksi Duitku & Signature v2 |
| `POST` | `/api/payment/callback` | Webhook callback Duitku (Verifikasi signature & idempotency) |
| `POST` | `/api/payment/check` | Mengecek status transaksi di Duitku / Database |
