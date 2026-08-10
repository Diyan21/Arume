# Arume Coffee Backend API (Cloudflare Workers Migration)

Backend API untuk **Arume Coffee** yang di-migrasi dari Node.js Express server tradisional ke **Cloudflare Workers** menggunakan framework **Hono**.

API ini berjalan di *Edge Network* Cloudflare, terhubung dengan **Supabase PostgreSQL**, serta memiliki sistem **Payment Gateway** yang mendukung *Sandbox Mock Mode* bawaan dan siap dihubungkan ke **Midtrans**.

---

## 📂 Structure & Architecture

```text
arume-coffee-api/
│
├── src/
│   ├── index.js             # Main Entry Point Cloudflare Worker (Hono App)
│   ├── config/
│   │   ├── supabase.js      # Supabase Client Initializer & Catalog Helper
│   │   └── payment.js       # Payment Gateway Service (Midtrans / Sandbox Mock)
│   ├── controllers/
│   │   ├── products.js      # Product Catalog Controller
│   │   ├── orders.js        # Order Processing Controller
│   │   └── payment.js       # Payment Creation & Webhook Callback Controller
│   └── utils/
│       └── response.js      # Standardized JSON Response Helpers
│
├── .dev.vars.example        # Template variabel lingkungan local wrangler
├── .gitignore               # Mengabaikan .dev.vars & node_modules
├── package.json             # NPM package & Cloudflare Workers scripts
├── server.js                # Local dev server adapter
├── wrangler.jsonc           # Konfigurasi Cloudflare Wrangler
└── README.md                # Dokumentasi Lengkap
```

---

## ⚡ Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Login ke Cloudflare (Wrangler)

```bash
npx wrangler login
```

### 3. Setup Local Environment Variables (.dev.vars)

Salin `.dev.vars.example` menjadi `.dev.vars`:

```bash
cp .dev.vars.example .dev.vars
```

Isi `.dev.vars` dengan credential Supabase Anda:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

FRONTEND_URL=https://arume-coffee.netlify.app

# Optional (Dapat dikosongkan untuk mode Sandbox Mock)
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_ENVIRONMENT=sandbox
```

> ⚠️ **PENTING**: File `.dev.vars` berisi rahasia/secrets. **JANGAN PERNAH** meng-commit atau memasukkan `.dev.vars` ke dalam repository GitHub!

### 4. Jalankan Dev Server

```bash
npm run dev
```

Wrangler akan menjalankan server Cloudflare Worker secara lokal di `http://localhost:8787`.

---

## 🚀 Deployment ke Cloudflare Workers via GitHub

### Langkah 1: Push Project ke GitHub

```bash
git add .
git commit -m "Migrate Arume Coffee Backend to Cloudflare Workers"
git push origin main
```

### Langkah 2: Hubungkan Repository ke Cloudflare Workers

1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com).
2. Pilih menu **Workers & Pages** > **Overview**.
3. Klik **Create Application** > **Workers**.
4. Pilih **Connect to Git** / **Import from GitHub**.
5. Pilih repository `arume-coffee-api` dan branch `main`.
6. Klik **Save and Deploy**.

### Langkah 3: Set Environment Variables / Secrets di Cloudflare

1. Pada halaman Worker `arume-coffee-api` di Cloudflare Dashboard, buka **Settings** > **Variables and Secrets**.
2. Tambahkan **Environment Variables / Secrets**:
   - `SUPABASE_URL` (Environment Variable)
   - `SUPABASE_SERVICE_ROLE_KEY` (Secret - Encrypted)
   - `FRONTEND_URL` (Contoh: `https://arume-coffee.netlify.app`)
   - `MIDTRANS_SERVER_KEY` (Secret - Optional)
   - `MIDTRANS_CLIENT_KEY` (Secret - Optional)
   - `MIDTRANS_ENVIRONMENT` (Nilai: `sandbox` atau `production`)
3. Klik **Deploy** ulang agar variabel lingkungan baru aktif.

### Langkah 4: Dapatkan URL API Production

Setelah di-deploy, Anda akan mendapatkan URL Worker resmi dari Cloudflare, contoh:
`https://arume-coffee-api.<subdomain>.workers.dev`

---

## 🌐 Netlify Frontend Integration

Frontend Arume Coffee yang berada di Netlify dapat menghubungkan backend API dengan menambahkan variabel lingkungan `VITE_API_URL` di Netlify / `.env.local`:

```env
VITE_API_URL=https://arume-coffee-api.<subdomain>.workers.dev
```

Contoh panggilan API pada Frontend (Vite / React):

```javascript
// Mengambil katalog produk
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
const result = await response.json();

if (result.success) {
  console.log('Daftar Produk:', result.data);
}
```

---

## 📊 Supabase PostgreSQL Database Schema

Jalankan script SQL ini di **Supabase SQL Editor** Anda:

```sql
-- 1. Table Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  category VARCHAR(100) DEFAULT 'Coffee',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  total_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending_payment',
  payment_status VARCHAR(50) DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL
);

-- 5. Table Payments
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  order_number VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  payment_type VARCHAR(100),
  snap_token TEXT,
  redirect_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 💳 Payment Gateway (Mock / Sandbox Mode & Midtrans)

Backend ini dirancang modular:
1. **Tanpa Credential Payment**: Backend dapat langsung digunakan. Panggilan ke `/api/payment/create` akan menghasilkan simulasi link pembayaran Sandbox Mock.
2. **Dengan Midtrans Credential**: Cukup isi `MIDTRANS_SERVER_KEY` di environment secret Cloudflare. Backend otomatis menggunakan Midtrans Snap API.

---

## 📡 API Endpoint Reference

Semua respon API mengembalikan format standar:
- **Sukses**: `{ "success": true, "message": "...", "data": {} }`
- **Gagal**: `{ "success": false, "message": "...", "error": "..." }`

### 1. Health Check
- **GET** `/api/health`

### 2. Products
- **GET** `/api/products` - Mengambil semua produk aktif.
- **GET** `/api/products/:id` - Mengambil detail produk berdasarkan ID.

### 3. Orders
- **POST** `/api/orders`
  - Body:
    ```json
    {
      "customer": {
        "name": "Budi Santoso",
        "phone": "081234567890",
        "email": "budi@example.com"
      },
      "items": [
        { "product_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "quantity": 2 }
      ],
      "notes": "Sedikit gula"
    }
    ```
- **GET** `/api/orders/:orderNumber` - Mengambil detail pesanan berdasarkan nomor pesanan (`ARUME-YYYYMMDD-XXXX`).

### 4. Payment
- **POST** `/api/payment/create`
  - Body: `{ "orderNumber": "ARUME-20260810-1234" }`
- **POST** `/api/payment/callback`
  - Webhook callback handler dengan idempotency check.
- **POST** `/api/payment/check`
  - Body: `{ "orderNumber": "ARUME-20260810-1234" }`

---

## 🛠️ CLI Commands

```bash
# Menjalankan local dev worker dengan Wrangler
npm run dev

# Menjalankan local server adapter
npm run local

# Deploy langsung ke Cloudflare Workers
npm run deploy
```
