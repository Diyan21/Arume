// src/admin/AdminStock.tsx

import React, {
  useEffect,
  useState
} from 'react';

import {
  LogOut,
  Minus,
  Plus,
  RefreshCcw,
  Save
} from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  category?: string | null;
};

type AdminStockProps = {
  secret: string;
  onLogout: () => void;
};

const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';

export function AdminStock({
  secret,
  onLogout
}: AdminStockProps) {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [savingId, setSavingId] =
    useState<string | null>(
      null
    );

  const [message, setMessage] =
    useState('');

  const [error, setError] =
    useState('');

  const formatPrice = (
    price: number
  ) => {
    return new Intl.NumberFormat(
      'id-ID',
      {
        style:
          'currency',

        currency:
          'IDR',

        maximumFractionDigits:
          0
      }
    ).format(
      price
    );
  };

  const loadProducts =
    async () => {
      setLoading(true);
      setError('');

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/products`,
            {
              headers: {
                'X-ADMIN-SECRET':
                  secret
              }
            }
          );

        if (
          response.status ===
          401
        ) {
          sessionStorage.removeItem(
            'arume_admin_secret'
          );

          onLogout();

          return;
        }

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              'Gagal mengambil produk.'
          );
        }

        const productData =
          result?.data
            ?.products ||
          result?.products ||
          [];

        setProducts(
          productData
        );

      } catch (err) {
        console.error(
          'Load products error:',
          err
        );

        setError(
          'Gagal mengambil data produk.'
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    loadProducts();
  }, []);

  const changeStock = (
    id: string,
    amount: number
  ) => {
    setProducts(
      current =>
        current.map(
          product => {
            if (
              product.id !==
              id
            ) {
              return product;
            }

            return {
              ...product,

              stock:
                Math.max(
                  0,
                  Number(
                    product.stock
                  ) +
                    amount
                )
            };
          }
        )
    );
  };

  const handleStockInput = (
    id: string,
    value: string
  ) => {
    const number =
      Number(value);

    setProducts(
      current =>
        current.map(
          product =>
            product.id === id
              ? {
                  ...product,

                  stock:
                    Number.isFinite(
                      number
                    )
                      ? Math.max(
                          0,
                          Math.floor(
                            number
                          )
                        )
                      : 0
                }
              : product
        )
    );
  };

  const saveStock =
    async (
      product: Product
    ) => {
      setSavingId(
        product.id
      );

      setError('');
      setMessage('');

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/products/${encodeURIComponent(
              product.id
            )}`,
            {
              method:
                'PATCH',

              headers: {
                'Content-Type':
                  'application/json',

                'X-ADMIN-SECRET':
                  secret
              },

              body:
                JSON.stringify({
                  stock:
                    product.stock
                })
            }
          );

        const result =
          await response.json();

        if (
          response.status ===
          401
        ) {
          sessionStorage.removeItem(
            'arume_admin_secret'
          );

          onLogout();

          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              'Gagal menyimpan stok.'
          );
        }

        setMessage(
          `Stok ${product.name} berhasil disimpan.`
        );

        await loadProducts();

      } catch (err) {
        console.error(
          'Save stock error:',
          err
        );

        setError(
          `Gagal menyimpan stok ${product.name}.`
        );
      } finally {
        setSavingId(
          null
        );
      }
    };

  const logout = () => {
    sessionStorage.removeItem(
      'arume_admin_secret'
    );

    onLogout();
  };

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f3ece2]">

      <header className="border-b border-[#30261e] bg-[#100c09] sticky top-0 z-20">

        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">

          <div>
            <p className="text-[#d4af37] text-xs tracking-[0.25em] uppercase">
              Arume Coffee
            </p>

            <h1 className="text-2xl font-bold">
              Admin Stok
            </h1>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={
                loadProducts
              }
              className="p-3 rounded-xl border border-[#3b3026] hover:border-[#d4af37] transition"
              title="Refresh"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>

            <button
              onClick={
                logout
              }
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-950/50 transition"
            >
              <LogOut className="w-4 h-4" />

              <span className="hidden sm:inline">
                Keluar
              </span>
            </button>

          </div>

        </div>

      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-7">

          <h2 className="text-3xl font-bold">
            Stok Produk
          </h2>

          <p className="text-[#ad9f91] mt-1">
            Ubah jumlah stok lalu tekan Simpan pada produk.
          </p>

        </div>

        {message && (
          <div className="mb-5 bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 rounded-xl px-4 py-3">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 bg-red-950/30 border border-red-500/30 text-red-300 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#a89b8d]">
            Memuat produk...
          </div>
        ) : (

          <div className="grid md:grid-cols-2 gap-4">

            {products.map(
              product => (

                <div
                  key={
                    product.id
                  }
                  className="bg-[#13100d] border border-[#302820] rounded-2xl p-5"
                >

                  <div className="flex justify-between gap-4 mb-5">

                    <div>
                      <p className="text-xs text-[#d4af37] uppercase tracking-wider mb-1">
                        {product.category ||
                          'Produk'}
                      </p>

                      <h3 className="text-lg font-bold">
                        {product.name}
                      </h3>

                      <p className="text-sm text-[#a89b8d] mt-1">
                        {formatPrice(
                          Number(
                            product.price
                          )
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#8f8377]">
                        ID
                      </p>

                      <p className="font-mono text-xs text-[#b8ab9e]">
                        {product.id}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-3">

                    <button
                      onClick={() =>
                        changeStock(
                          product.id,
                          -1
                        )
                      }
                      className="w-11 h-11 rounded-xl border border-[#44372c] flex items-center justify-center hover:border-[#d4af37] transition"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={
                        product.stock
                      }
                      onChange={(
                        e
                      ) =>
                        handleStockInput(
                          product.id,
                          e.target.value
                        )
                      }
                      className="flex-1 min-w-0 text-center text-xl font-bold bg-[#090705] border border-[#44372c] rounded-xl h-11 outline-none focus:border-[#d4af37]"
                    />

                    <button
                      onClick={() =>
                        changeStock(
                          product.id,
                          1
                        )
                      }
                      className="w-11 h-11 rounded-xl border border-[#44372c] flex items-center justify-center hover:border-[#d4af37] transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                  </div>

                  <button
                    onClick={() =>
                      saveStock(
                        product
                      )
                    }
                    disabled={
                      savingId ===
                      product.id
                    }
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e2c256] disabled:opacity-50 text-black font-bold rounded-xl py-3 transition"
                  >
                    <Save className="w-4 h-4" />

                    {savingId ===
                    product.id
                      ? 'Menyimpan...'
                      : 'Simpan Stok'}
                  </button>

                </div>

              )
            )}

          </div>
        )}

      </main>

    </div>
  );
}
