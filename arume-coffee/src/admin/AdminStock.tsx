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
  Save,
  Truck
} from 'lucide-react';


type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string | null;
  category?: string | null;
};


type ShippingRate = {
  id: number;
  min_distance: number;
  max_distance: number;
  fee: number;
  active: boolean;
  created_at?: string | null;
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

  const [
    products,
    setProducts
  ] =
    useState<Product[]>([]);


  const [
    shippingRates,
    setShippingRates
  ] =
    useState<ShippingRate[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );


  const [
    shippingLoading,
    setShippingLoading
  ] =
    useState(
      true
    );


  const [
    savingId,
    setSavingId
  ] =
    useState<string | null>(
      null
    );


  const [
    savingShippingId,
    setSavingShippingId
  ] =
    useState<number | null>(
      null
    );


  const [
    message,
    setMessage
  ] =
    useState(
      ''
    );


  const [
    error,
    setError
  ] =
    useState(
      ''
    );


  /* =========================================================
     FORMAT
     ========================================================= */

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


  /* =========================================================
     AUTH HANDLER
     ========================================================= */

  const handleUnauthorized =
    () => {

      sessionStorage.removeItem(
        'arume_admin_secret'
      );


      onLogout();
    };


  /* =========================================================
     LOAD PRODUCTS
     ========================================================= */

  const loadProducts =
    async () => {

      setLoading(
        true
      );

      setError(
        ''
      );


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

          handleUnauthorized();

          return;
        }


        const result =
          await response.json();


        if (
          !response.ok
        ) {

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
          Array.isArray(
            productData
          )
            ? productData
            : []
        );


      } catch (
        err
      ) {

        console.error(
          'Load products error:',
          err
        );


        setError(
          'Gagal mengambil data produk.'
        );


      } finally {

        setLoading(
          false
        );

      }
    };


  /* =========================================================
     LOAD SHIPPING
     ========================================================= */

  const loadShippingRates =
    async () => {

      setShippingLoading(
        true
      );


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/shipping`,
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

          handleUnauthorized();

          return;
        }


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            result?.message ||
              'Gagal mengambil tarif ongkir.'
          );
        }


        const shippingData =
          result?.data
            ?.shipping_rates ||
          result?.shipping_rates ||
          [];


        setShippingRates(
          Array.isArray(
            shippingData
          )
            ? shippingData.map(
                (
                  rate:
                    ShippingRate
                ) => ({

                  ...rate,

                  min_distance:
                    Number(
                      rate.min_distance
                    ),

                  max_distance:
                    Number(
                      rate.max_distance
                    ),

                  fee:
                    Number(
                      rate.fee
                    ),

                  active:
                    Boolean(
                      rate.active
                    )

                })
              )
            : []
        );


      } catch (
        err
      ) {

        console.error(
          'Load shipping error:',
          err
        );


        setError(
          'Gagal mengambil data ongkir.'
        );


      } finally {

        setShippingLoading(
          false
        );

      }
    };


  /* =========================================================
     LOAD ALL
     ========================================================= */

  const loadAll =
    async () => {

      setMessage(
        ''
      );

      setError(
        ''
      );


      await Promise.all([
        loadProducts(),
        loadShippingRates()
      ]);
    };


  useEffect(
    () => {

      loadAll();

    },
    []
  );


  /* =========================================================
     STOCK HANDLER
     ========================================================= */

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
      Number(
        value
      );


    setProducts(
      current =>

        current.map(
          product =>

            product.id ===
            id
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


  /* =========================================================
     SAVE STOCK
     ========================================================= */

  const saveStock =
    async (
      product: Product
    ) => {

      setSavingId(
        product.id
      );


      setError(
        ''
      );

      setMessage(
        ''
      );


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

          handleUnauthorized();

          return;
        }


        if (
          !response.ok
        ) {

          throw new Error(
            result?.message ||
              'Gagal menyimpan stok.'
          );
        }


        setMessage(
          `Stok ${product.name} berhasil disimpan.`
        );


        await loadProducts();


      } catch (
        err
      ) {

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


  /* =========================================================
     SHIPPING INPUT HANDLER
     ========================================================= */

  const updateShippingField = (
    id: number,
    field:
      | 'min_distance'
      | 'max_distance'
      | 'fee',
    value: string
  ) => {

    const numericValue =
      Number(
        value
      );


    setShippingRates(
      current =>

        current.map(
          rate => {

            if (
              rate.id !==
              id
            ) {

              return rate;
            }


            return {

              ...rate,

              [field]:
                Number.isFinite(
                  numericValue
                )
                  ? Math.max(
                      0,
                      numericValue
                    )
                  : 0

            };
          }
        )
    );
  };


  const toggleShippingActive =
    (
      id: number
    ) => {

      setShippingRates(
        current =>

          current.map(
            rate =>

              rate.id ===
              id
                ? {

                    ...rate,

                    active:
                      !rate.active

                  }
                : rate
          )
      );
    };


  /* =========================================================
     SAVE SHIPPING
     ========================================================= */

  const saveShippingRate =
    async (
      rate:
        ShippingRate
    ) => {

      setSavingShippingId(
        rate.id
      );


      setError(
        ''
      );

      setMessage(
        ''
      );


      try {

        if (
          rate.min_distance <
          0
        ) {

          throw new Error(
            'Jarak minimum tidak valid.'
          );
        }


        if (
          rate.max_distance <=
          rate.min_distance
        ) {

          throw new Error(
            'Jarak maksimum harus lebih besar dari jarak minimum.'
          );
        }


        if (
          rate.fee <
          0
        ) {

          throw new Error(
            'Ongkir tidak boleh negatif.'
          );
        }


        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/shipping/${encodeURIComponent(
              String(
                rate.id
              )
            )}`,
            {

              method:
                'PUT',

              headers: {

                'Content-Type':
                  'application/json',

                'X-ADMIN-SECRET':
                  secret

              },

              body:
                JSON.stringify({

                  min_distance:
                    Number(
                      rate.min_distance
                    ),

                  max_distance:
                    Number(
                      rate.max_distance
                    ),

                  fee:
                    Math.floor(
                      Number(
                        rate.fee
                      )
                    ),

                  active:
                    rate.active

                })

            }
          );


        const result =
          await response.json();


        if (
          response.status ===
          401
        ) {

          handleUnauthorized();

          return;
        }


        if (
          !response.ok
        ) {

          throw new Error(
            result?.message ||
              result?.error ||
              'Gagal menyimpan tarif ongkir.'
          );
        }


        setMessage(
          `Tarif ${rate.min_distance}–${rate.max_distance} KM berhasil disimpan.`
        );


        await loadShippingRates();


      } catch (
        err
      ) {

        console.error(
          'Save shipping error:',
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan tarif ongkir.'
        );


      } finally {

        setSavingShippingId(
          null
        );

      }
    };


  /* =========================================================
     LOGOUT
     ========================================================= */

  const logout =
    () => {

      sessionStorage.removeItem(
        'arume_admin_secret'
      );


      onLogout();
    };


  /* =========================================================
     UI
     ========================================================= */

  return (

    <div className="min-h-screen bg-[#0a0806] text-[#f3ece2]">


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="border-b border-[#30261e] bg-[#100c09] sticky top-0 z-20">

        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">


          <div>

            <p className="text-[#d4af37] text-xs tracking-[0.25em] uppercase">
              Arume Coffee
            </p>


            <h1 className="text-2xl font-bold">
              Admin Panel
            </h1>

          </div>


          <div className="flex items-center gap-2">


            <button
              onClick={
                loadAll
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


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="max-w-6xl mx-auto px-4 py-8">


        {/* ===================================================
            MESSAGE
            =================================================== */}

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


        {/* ===================================================
            STOCK SECTION
            =================================================== */}

        <section>


          <div className="mb-7">

            <h2 className="text-3xl font-bold">
              Stok Produk
            </h2>


            <p className="text-[#ad9f91] mt-1">
              Ubah jumlah stok lalu tekan Simpan pada produk.
            </p>

          </div>


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
                        onClick={
                          () =>
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
                        onChange={
                          (
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
                        onClick={
                          () =>
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
                      onClick={
                        () =>
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

        </section>


        {/* ===================================================
            SHIPPING SECTION
            =================================================== */}

        <section className="mt-14 pt-10 border-t border-[#30261e]">


          <div className="mb-7 flex items-start gap-4">


            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">

              <Truck className="w-6 h-6 text-[#d4af37]" />

            </div>


            <div>

              <h2 className="text-3xl font-bold">
                Pengaturan Ongkir
              </h2>


              <p className="text-[#ad9f91] mt-1">
                Atur tarif pengiriman berdasarkan jarak dari Arume Coffee.
              </p>

            </div>

          </div>


          {shippingLoading ? (

            <div className="text-center py-16 text-[#a89b8d]">

              Memuat tarif ongkir...

            </div>

          ) : shippingRates.length ===
            0 ? (

            <div className="bg-[#13100d] border border-[#302820] rounded-2xl p-6 text-[#ad9f91]">

              Belum ada tarif ongkir.

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-4">


              {shippingRates.map(
                rate => (

                  <div
                    key={
                      rate.id
                    }
                    className="bg-[#13100d] border border-[#302820] rounded-2xl p-5"
                  >


                    <div className="flex items-center justify-between gap-4 mb-5">


                      <div>

                        <p className="text-xs text-[#d4af37] uppercase tracking-wider">
                          Zona Pengiriman
                        </p>


                        <h3 className="text-lg font-bold mt-1">

                          {rate.min_distance} KM
                          {' — '}
                          {rate.max_distance} KM

                        </h3>

                      </div>


                      <button
                        type="button"
                        onClick={
                          () =>
                            toggleShippingActive(
                              rate.id
                            )
                        }
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                          rate.active
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/30 border-red-500/30 text-red-300'
                        }`}
                      >

                        {rate.active
                          ? 'AKTIF'
                          : 'NONAKTIF'}

                      </button>


                    </div>


                    <div className="grid grid-cols-2 gap-3 mb-3">


                      <div>

                        <label className="text-xs text-[#a89b8d] block mb-2">
                          Dari KM
                        </label>


                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={
                            rate.min_distance
                          }
                          onChange={
                            e =>
                              updateShippingField(
                                rate.id,
                                'min_distance',
                                e.target.value
                              )
                          }
                          className="w-full bg-[#090705] border border-[#44372c] rounded-xl h-11 px-3 outline-none focus:border-[#d4af37]"
                        />

                      </div>


                      <div>

                        <label className="text-xs text-[#a89b8d] block mb-2">
                          Sampai KM
                        </label>


                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={
                            rate.max_distance
                          }
                          onChange={
                            e =>
                              updateShippingField(
                                rate.id,
                                'max_distance',
                                e.target.value
                              )
                          }
                          className="w-full bg-[#090705] border border-[#44372c] rounded-xl h-11 px-3 outline-none focus:border-[#d4af37]"
                        />

                      </div>


                    </div>


                    <div>

                      <label className="text-xs text-[#a89b8d] block mb-2">
                        Tarif Ongkir
                      </label>


                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4af37] font-bold">
                          Rp
                        </span>


                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={
                            rate.fee
                          }
                          onChange={
                            e =>
                              updateShippingField(
                                rate.id,
                                'fee',
                                e.target.value
                              )
                          }
                          className="w-full bg-[#090705] border border-[#44372c] rounded-xl h-12 pl-12 pr-4 text-lg font-bold outline-none focus:border-[#d4af37]"
                        />

                      </div>


                      <p className="text-sm text-[#8f8377] mt-2">

                        {formatPrice(
                          Number(
                            rate.fee
                          )
                        )}

                      </p>

                    </div>


                    <button
                      onClick={
                        () =>
                          saveShippingRate(
                            rate
                          )
                      }
                      disabled={
                        savingShippingId ===
                        rate.id
                      }
                      className="mt-5 w-full flex items-center justify-center gap-2 bg-[#d4af37] hover:bg-[#e2c256] disabled:opacity-50 text-black font-bold rounded-xl py-3 transition"
                    >

                      <Save className="w-4 h-4" />


                      {savingShippingId ===
                      rate.id
                        ? 'Menyimpan...'
                        : 'Simpan Tarif Ongkir'}

                    </button>


                  </div>

                )
              )}


            </div>

          )}


          <div className="mt-5 rounded-2xl border border-[#302820] bg-[#100c09] px-5 py-4">

            <p className="text-sm font-semibold text-[#d4af37]">
              Cara kerja tarif
            </p>


            <p className="text-sm text-[#a89b8d] mt-1">

              Sistem akan memilih zona berdasarkan jarak pelanggan.
              Tarif yang dinonaktifkan tidak akan ditampilkan pada checkout.

            </p>

          </div>


        </section>


      </main>


    </div>

  );
                          }
