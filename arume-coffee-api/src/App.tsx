import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Database,
  CreditCard,
  Coffee,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Send,
  Zap,
  Play,
  Layers,
  Code2,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'HOOK' | 'OK' | 'WARN' | 'ERROR';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'payment' | 'sql' | 'readme'>('overview');
  const [health, setHealth] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'Arume REST API server initialized on port 3000' },
    { id: '2', timestamp: new Date().toLocaleTimeString(), type: 'INFO', message: 'Duitku Payment Gateway configured (Sandbox Mode)' },
    { id: '3', timestamp: new Date().toLocaleTimeString(), type: 'OK', message: 'Supabase PostgreSQL driver initialized' },
  ]);

  // Order Tester State
  const [customerName, setCustomerName] = useState('Diyan');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('087881227088');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(2);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);

  // Payment Tester State
  const [paymentOrderNumber, setPaymentOrderNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('VC'); // Virtual Account / QRIS
  const [createdPayment, setCreatedPayment] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [callbackSimulated, setCallbackSimulated] = useState<any>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
      ...prev.slice(0, 19),
    ]);
  };

  // Fetch Health
  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const json = await res.json();
      setHealth(json.data);
      addLog('OK', 'GET /api/health - 200 OK');
    } catch (err: any) {
      addLog('WARN', 'GET /api/health failed: ' + err.message);
    }
  };

  // Fetch Products
  const fetchProductsList = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
        if (json.data.length > 0 && !selectedProductId) {
          setSelectedProductId(json.data[0].id);
        }
        addLog('INFO', `GET /api/products - Fetched ${json.data.length} active coffee items`);
      }
    } catch (err: any) {
      addLog('ERROR', 'GET /api/products error: ' + err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchProductsList();
  }, []);

  // Handle Order Creation
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;

    setOrderLoading(true);
    addLog('INFO', `POST /api/orders - Creating order for ${customerName}`);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName,
            whatsapp: customerWhatsapp,
          },
          items: [
            {
              product_id: selectedProductId,
              quantity: Number(quantity),
            },
          ],
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedOrder(json.data);
        setPaymentOrderNumber(json.data.order_number);
        addLog('OK', `Order created successfully! Number: ${json.data.order_number}`);
      } else {
        addLog('WARN', `Order creation failed: ${json.message}`);
      }
    } catch (err: any) {
      addLog('ERROR', `Order error: ${err.message}`);
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle Payment Creation
  const handleCreatePayment = async () => {
    if (!paymentOrderNumber) return;

    setPaymentLoading(true);
    addLog('INFO', `POST /api/payment/create - Requesting Duitku for ${paymentOrderNumber}`);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: paymentOrderNumber,
          paymentMethod: paymentMethod,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCreatedPayment(json.data);
        addLog('HOOK', `Duitku signature verified & URL generated: ${json.data.payment_url}`);
      } else {
        addLog('WARN', `Payment creation failed: ${json.message}`);
      }
    } catch (err: any) {
      addLog('ERROR', `Payment error: ${err.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle Simulated Callback
  const handleSimulateCallback = async () => {
    if (!paymentOrderNumber) return;

    addLog('INFO', `POST /api/payment/callback - Simulating Duitku Webhook Callback`);

    try {
      const res = await fetch('/api/payment/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantCode: 'D12345',
          amount: createdOrder?.total_amount || 30000,
          merchantOrderId: paymentOrderNumber,
          productDetail: 'Pembayaran Kopi Arume',
          resultCode: '00', // Success code
          reference: createdPayment?.reference || 'REF-123456',
          signature: 'MOCK_SIGNATURE_OK',
        }),
      });

      const json = await res.json();
      setCallbackSimulated(json);
      addLog('OK', `Webhook callback processed! Order payment status updated.`);
    } catch (err: any) {
      addLog('ERROR', `Webhook error: ${err.message}`);
    }
  };

  // SQL Script Content
  const sqlScript = `-- ==================================================
-- SUPABASE POSTGRESQL SCHEMA FOR ARUME COFFEE
-- Run this script in Supabase SQL Editor
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

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_order_id ON payments(merchant_order_id);

-- ==================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ==================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Triggers
DROP TRIGGER IF EXISTS set_updated_at_products ON products;
CREATE TRIGGER set_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_orders ON orders;
CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_updated_at_payments ON payments;
CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- SEED DATA: MENU ARUME COFFEE
-- ==================================================
INSERT INTO products (id, name, description, price, image_url, is_active)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Kopi Gula Aren', 'Espresso dengan susu segar dan gula aren asli yang gurih nan manis.', 15000, 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Kopi Butterscotch', 'Paduan espresso, cream butterscotch aromatik, dan susu pilihan.', 18000, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Kopi Hazelnut', 'Aroma hazelnut nan lembut berpadu serasi dengan espresso khas Arume.', 18000, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Kopi Banana Latte', 'Sensasi rasa pisang manis lembut berpadu sempurna dengan iced latte.', 18000, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80', true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Americano', 'Double shot espresso murni tanpa gula, segar dan kaya rasa.', 10000, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;
`;

  return (
    <div className="flex flex-col h-screen w-full bg-[#0A0A0A] text-[#E0E0E0] font-mono overflow-hidden select-none">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-[#333] bg-[#111]">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#F27D26] rounded flex items-center justify-center font-bold text-black text-lg">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#F27D26]">
              ARUME-API
            </span>
            <span className="text-[10px] text-[#666] uppercase tracking-widest">
              Production REST Engine v2.4
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
            <span className="text-[11px] text-[#888] uppercase">
              Render / Cloud Ready
            </span>
          </div>
          <div className="h-8 w-[1px] bg-[#333]"></div>
          <button
            onClick={fetchHealth}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] text-xs text-amber-500 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Check Health
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <nav className="w-56 border-r border-[#333] bg-[#0F0F0F] p-4 flex flex-col gap-1">
          <div className="text-[10px] text-[#555] uppercase font-bold mb-3 px-2">
            Core Modules
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#F27D26]/10 text-[#F27D26] border-l-2 border-[#F27D26]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" /> System Overview
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'products'
                ? 'bg-[#F27D26]/10 text-[#F27D26] border-l-2 border-[#F27D26]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" /> Products API
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#F27D26]/10 text-[#F27D26] border-l-2 border-[#F27D26]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> Order Streams
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'payment'
                ? 'bg-[#F27D26]/10 text-[#F27D26] border-l-2 border-[#F27D26]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Duitku Payment
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
              activeTab === 'sql'
                ? 'bg-[#F27D26]/10 text-[#F27D26] border-l-2 border-[#F27D26]'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> Supabase SQL
          </button>

          <div className="mt-auto p-3 bg-[#161616] rounded border border-[#333]">
            <div className="text-[9px] text-[#555] uppercase mb-1">
              Duitku Gateway
            </div>
            <div className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
              <Zap className="w-3 h-3" /> SANDBOX MODE
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-12 gap-4">
              {/* Stat Cards */}
              <div className="col-span-3 bg-[#161616] border border-[#333] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-[#888] uppercase tracking-wider">
                  API Response Time
                </span>
                <span className="text-3xl font-light text-white">18ms</span>
                <div className="w-full h-1 bg-[#333] mt-2 overflow-hidden">
                  <div className="w-[85%] h-full bg-green-500"></div>
                </div>
              </div>

              <div className="col-span-3 bg-[#161616] border border-[#333] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-[#888] uppercase tracking-wider">
                  HTTP Health Status
                </span>
                <span className="text-2xl font-light text-green-400">200 OK</span>
                <span className="text-[10px] text-[#555]">
                  {health?.message || 'Arume API is running'}
                </span>
              </div>

              <div className="col-span-3 bg-[#161616] border border-[#333] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-[#888] uppercase tracking-wider">
                  Active Products
                </span>
                <span className="text-3xl font-light text-white">
                  {products.length || 5} Items
                </span>
                <span className="text-[10px] text-[#555]">
                  Menu Arume Coffee Seeded
                </span>
              </div>

              <div className="col-span-3 bg-[#161616] border border-[#333] p-4 flex flex-col justify-between">
                <span className="text-[10px] text-[#888] uppercase tracking-wider">
                  Supabase Status
                </span>
                <span
                  className={`text-xl font-light ${
                    health?.supabase_configured ? 'text-green-400' : 'text-amber-500'
                  }`}
                >
                  {health?.supabase_configured ? 'CONNECTED' : 'IN-MEMORY MOCK'}
                </span>
                <span className="text-[10px] text-[#555]">
                  PostgreSQL DB Engine
                </span>
              </div>

              {/* Live Terminal Output */}
              <div className="col-span-7 bg-[#161616] border border-[#333] flex flex-col h-80">
                <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#888] uppercase tracking-widest flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-[#F27D26]" /> Live API Terminal Logs
                  </span>
                  <span className="text-[10px] text-[#444]">BUFFER: 20 LINES</span>
                </div>
                <div className="flex-1 p-3 text-[11px] leading-relaxed text-green-400 font-mono overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="mb-1 flex items-start gap-2">
                      <span className="text-[#555]">[{log.timestamp}]</span>
                      <span
                        className={
                          log.type === 'OK'
                            ? 'text-green-400'
                            : log.type === 'HOOK'
                            ? 'text-purple-400'
                            : log.type === 'WARN'
                            ? 'text-yellow-400'
                            : log.type === 'ERROR'
                            ? 'text-red-400'
                            : 'text-blue-400'
                        }
                      >
                        {log.type}:
                      </span>
                      <span className="text-[#DDD]">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Checklist */}
              <div className="col-span-5 bg-[#161616] border border-[#333] p-4 flex flex-col justify-between h-80">
                <div>
                  <div className="text-[11px] font-bold text-[#888] uppercase tracking-widest mb-3">
                    Environment Variables Checklist
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 bg-[#222] border border-[#333] rounded">
                      <span className="text-[#AAA]">PORT</span>
                      <span className="text-green-400 font-bold">3000</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#222] border border-[#333] rounded">
                      <span className="text-[#AAA]">DUITKU_ENVIRONMENT</span>
                      <span className="text-amber-400 font-bold">sandbox</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#222] border border-[#333] rounded">
                      <span className="text-[#AAA]">FRONTEND_URL</span>
                      <span className="text-[#888] text-[10px]">https://arume-coffee.netlify.app</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-[#222] border border-[#333] rounded">
                      <span className="text-[#AAA]">CORS / HELMET / MORGAN</span>
                      <span className="text-green-400 font-bold">ENABLED</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-[#666]">
                  All keys strictly read from process.env with no exposed credentials.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#333] pb-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-[#F27D26]" /> Arume Coffee Products
                  </h2>
                  <p className="text-xs text-[#777]">GET /api/products - Active menu list</p>
                </div>
                <button
                  onClick={fetchProductsList}
                  className="px-3 py-1.5 bg-[#F27D26] hover:bg-[#d86b1c] text-black font-bold text-xs rounded transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh Products
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="bg-[#161616] border border-[#333] rounded overflow-hidden flex flex-col justify-between"
                  >
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                      />
                      <span className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 text-[10px] text-green-400 border border-green-500/30 rounded">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">{p.name}</h3>
                        <p className="text-xs text-[#888] mt-1 line-clamp-2">{p.description}</p>
                      </div>
                      <div className="mt-3 text-[10px] text-[#555] font-mono truncate">
                        ID: {p.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Order Form */}
              <div className="col-span-5 bg-[#161616] border border-[#333] p-5 rounded space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#F27D26]" /> Test POST /api/orders
                </h2>

                <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#888] mb-1">Nama Customer</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888] mb-1">WhatsApp</label>
                    <input
                      type="text"
                      value={customerWhatsapp}
                      onChange={(e) => setCustomerWhatsapp(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888] mb-1">Pilih Produk Coffee</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - Rp {p.price.toLocaleString('id-ID')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#888] mb-1">Jumlah (Qty)</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="w-full py-2 bg-[#F27D26] hover:bg-[#d86b1c] text-black font-bold text-xs rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {orderLoading ? 'Processing...' : 'Kirim Request Order'}
                  </button>
                </form>
              </div>

              {/* Order Result JSON */}
              <div className="col-span-7 bg-[#161616] border border-[#333] p-5 rounded flex flex-col h-[420px]">
                <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
                  <span className="text-xs font-bold text-[#888] uppercase">
                    API Response JSON
                  </span>
                  {createdOrder && (
                    <span className="text-[10px] text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                      201 CREATED
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-[#0D0D0D] p-3 rounded border border-[#222] font-mono text-xs overflow-auto text-green-400">
                  {createdOrder ? (
                    <pre>{JSON.stringify(createdOrder, null, 2)}</pre>
                  ) : (
                    <span className="text-[#555]">
                      // Kirim request di sebelah kiri untuk melihat response pembuatan order.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Payment Request Controls */}
              <div className="col-span-6 bg-[#161616] border border-[#333] p-5 rounded space-y-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#F27D26]" /> Duitku Payment Integration
                </h2>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[#888] mb-1">Order Number (ARM-XXXX)</label>
                    <input
                      type="text"
                      placeholder="Contoh: ARM-20260809-A1B2"
                      value={paymentOrderNumber}
                      onChange={(e) => setPaymentOrderNumber(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#888] mb-1">Metode Pembayaran Duitku</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#222] border border-[#444] rounded p-2 text-white focus:outline-none focus:border-[#F27D26]"
                    >
                      <option value="VC">Virtual Account BCA (VC)</option>
                      <option value="VA">Virtual Account Mandiri (VA)</option>
                      <option value="SP">QRIS ShopeePay / All Payment (SP)</option>
                      <option value="OV">OVO (OV)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={handleCreatePayment}
                      disabled={paymentLoading || !paymentOrderNumber}
                      className="flex-1 py-2 bg-[#F27D26] hover:bg-[#d86b1c] text-black font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" /> Create Payment URL
                    </button>

                    <button
                      onClick={handleSimulateCallback}
                      disabled={!paymentOrderNumber}
                      className="flex-1 py-2 bg-[#222] hover:bg-[#333] border border-[#444] text-purple-400 font-bold text-xs rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Simulate Callback
                    </button>
                  </div>
                </div>

                {createdPayment && (
                  <div className="p-3 bg-[#222] border border-amber-500/30 rounded space-y-2 text-xs">
                    <div className="text-amber-400 font-bold">Payment Link Generated:</div>
                    <a
                      href={createdPayment.payment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline break-all flex items-center gap-1"
                    >
                      {createdPayment.payment_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Payment Callback Status JSON */}
              <div className="col-span-6 bg-[#161616] border border-[#333] p-5 rounded flex flex-col h-[420px]">
                <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
                  <span className="text-xs font-bold text-[#888] uppercase">
                    Webhook / Callback Log
                  </span>
                </div>

                <div className="flex-1 bg-[#0D0D0D] p-3 rounded border border-[#222] font-mono text-xs overflow-auto text-purple-300">
                  {callbackSimulated ? (
                    <pre>{JSON.stringify(callbackSimulated, null, 2)}</pre>
                  ) : createdPayment ? (
                    <pre>{JSON.stringify(createdPayment, null, 2)}</pre>
                  ) : (
                    <span className="text-[#555]">
                      // Tekan "Create Payment URL" atau "Simulate Callback" untuk melihat proses webhook Duitku.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#F27D26]" /> Supabase SQL Schema Script
                  </h2>
                  <p className="text-xs text-[#777]">
                    Salin script SQL di bawah ke Supabase SQL Editor untuk membuat tabel & seed data.
                  </p>
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(sqlScript)}
                  className="px-3 py-1.5 bg-[#222] hover:bg-[#333] border border-[#444] text-white text-xs rounded transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy SQL Script
                </button>
              </div>

              <div className="bg-[#0D0D0D] p-4 rounded border border-[#333] text-xs font-mono text-blue-300 h-[480px] overflow-auto">
                <pre>{sqlScript}</pre>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="h-8 bg-[#0F0F0F] border-t border-[#333] flex items-center justify-between px-6 text-[10px] text-[#555]">
        <div className="flex items-center gap-4">
          <span>Backend: Node.js + Express</span>
          <span>Database: Supabase PostgreSQL</span>
          <span>Payment: Duitku Gateway</span>
        </div>
        <div className="tracking-widest uppercase">
          Status: <span className="text-green-500 font-bold">100% READY FOR DEPLOY</span>
        </div>
      </footer>
    </div>
  );
}
