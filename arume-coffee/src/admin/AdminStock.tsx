// src/admin/AdminStock.tsx

import React, {
  useEffect,
  useState
} from 'react';

import {
  Check,
  CheckCircle2,
  Clock3,
  Coffee,
  LogOut,
  MapPin,
  Minus,
  PackageCheck,
  Plus,
  ReceiptText,
  RefreshCcw,
  Save,
  ShoppingBag,
  Store,
  Trash2,
  Truck,
  XCircle
} from 'lucide-react';


/* =========================================================
   TYPES
   ========================================================= */

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


type OrderItem = {
  id?: number | string;
  product_id?: string | null;
  product_name?: string | null;
  price?: number;
  quantity?: number;
  subtotal?: number;
};


type AdminOrder = {
  id?: number | string;

  checkout_id?: string | null;

  order_number: string;

  customer_name?: string | null;

  customer_email?: string | null;

  customer_phone?: string | null;

  subtotal_amount?: number;

  shipping_fee?: number;

  total_amount?: number;

  delivery_type?: string | null;

  delivery_address?: string | null;

  delivery_distance_km?: number | null;

  status: string;

  status_label?: string | null;

  notes?: string | null;

  payment_provider?: string | null;

  payment_method?: string | null;

  payment_id?: string | null;

  payment_url?: string | null;

  paid_at?: string | null;

  created_at?: string | null;

  updated_at?: string | null;

  items?: OrderItem[];
};


type AdminStockProps = {
  secret: string;
  onLogout: () => void;
};


type AdminTab =
  | 'orders'
  | 'stock'
  | 'shipping';


type OrderFilter =
  | 'active'
  | 'pending'
  | 'history';


/* =========================================================
   API
   ========================================================= */

const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';


/* =========================================================
   COMPONENT
   ========================================================= */

export function AdminStock({
  secret,
  onLogout
}: AdminStockProps) {


  /* =========================================================
     ACTIVE TAB
     ========================================================= */

  const [
    activeTab,
    setActiveTab
  ] =
    useState<AdminTab>(
      'orders'
    );


  /* =========================================================
     ORDER FILTER
     ========================================================= */

  const [
    orderFilter,
    setOrderFilter
  ] =
    useState<OrderFilter>(
      'active'
    );


  /* =========================================================
     PRODUCTS
     ========================================================= */

  const [
    products,
    setProducts
  ] =
    useState<Product[]>(
      []
    );


  const [
    loading,
    setLoading
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


  /* =========================================================
     SHIPPING
     ========================================================= */

  const [
    shippingRates,
    setShippingRates
  ] =
    useState<ShippingRate[]>(
      []
    );


  const [
    shippingLoading,
    setShippingLoading
  ] =
    useState(
      true
    );


  const [
    savingShippingId,
    setSavingShippingId
  ] =
    useState<number | null>(
      null
    );


  /* =========================================================
     ORDERS
     ========================================================= */

  const [
    orders,
    setOrders
  ] =
    useState<AdminOrder[]>(
      []
    );


  const [
    ordersLoading,
    setOrdersLoading
  ] =
    useState(
      true
    );


  const [
    updatingOrderNumber,
    setUpdatingOrderNumber
  ] =
    useState<string | null>(
      null
    );


  const [
    deletingOrderNumber,
    setDeletingOrderNumber
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     MESSAGE
     ========================================================= */

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
     FORMAT PRICE
     ========================================================= */

  const formatPrice =
    (
      price:
        number
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
        Number(
          price ||
          0
        )
      );
    };


  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate =
    (
      dateValue?:
        string | null
    ) => {

      if (
        !dateValue
      ) {

        return '-';
      }


      const date =
        new Date(
          dateValue
        );


      if (
        Number.isNaN(
          date.getTime()
        )
      ) {

        return '-';
      }


      return new Intl.DateTimeFormat(
        'id-ID',
        {
          dateStyle:
            'medium',

          timeStyle:
            'short'
        }
      ).format(
        date
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
            ? productData.map(
                (
                  product:
                    Product
                ) => ({
                  ...product,

                  price:
                    Number(
                      product.price
                    ),

                  stock:
                    Number(
                      product.stock
                    )
                })
              )
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
     LOAD ORDERS
     ========================================================= */

  const loadOrders =
    async (
      silent =
        false
    ) => {

      if (
        !silent
      ) {

        setOrdersLoading(
          true
        );
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/orders`,
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
            result?.error ||
            'Gagal mengambil pesanan.'
          );
        }


        const orderData =
          result?.data
            ?.orders ||

          result?.orders ||

          [];


        const normalizedOrders:
          AdminOrder[] =

          Array.isArray(
            orderData
          )
            ? orderData.map(
                (
                  order:
                    AdminOrder
                ) => ({
                  ...order,

                  status:
                    String(
                      order.status ||
                      'pending'
                    )
                      .trim()
                      .toLowerCase(),

                  subtotal_amount:
                    Number(
                      order.subtotal_amount ??
                      0
                    ),

                  shipping_fee:
                    Number(
                      order.shipping_fee ??
                      0
                    ),

                  total_amount:
                    Number(
                      order.total_amount ??
                      0
                    ),

                  delivery_distance_km:
                    order.delivery_distance_km ===
                    null
                      ? null
                      : Number(
                          order.delivery_distance_km
                        ),

                  items:
                    Array.isArray(
                      order.items
                    )
                      ? order.items.map(
                          item => ({
                            ...item,

                            price:
                              Number(
                                item.price ??
                                0
                              ),

                            quantity:
                              Number(
                                item.quantity ??
                                0
                              ),

                            subtotal:
                              Number(
                                item.subtotal ??
                                0
                              )
                          })
                        )
                      : []
                })
              )
            : [];


        setOrders(
          normalizedOrders
        );


      } catch (
        err
      ) {

        console.error(
          'Load orders error:',
          err
        );


        if (
          !silent
        ) {

          setError(
            'Gagal mengambil data pesanan.'
          );
        }


      } finally {

        if (
          !silent
        ) {

          setOrdersLoading(
            false
          );
        }

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
        loadOrders(),
        loadProducts(),
        loadShippingRates()
      ]);
    };


  /* =========================================================
     INITIAL LOAD
     ========================================================= */

  useEffect(
    () => {

      loadAll();

    },
    []
  );


  /* =========================================================
     AUTO REFRESH ORDERS
     ========================================================= */

  useEffect(
    () => {

      const interval =
        window.setInterval(
          () => {

            loadOrders(
              true
            );

          },
          10000
        );


      return () => {

        window.clearInterval(
          interval
        );
      };

    },
    [
      secret
    ]
  );


  /* =========================================================
     STOCK HANDLER
     ========================================================= */

  const changeStock =
    (
      id:
        string,

      amount:
        number
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


  const handleStockInput =
    (
      id:
        string,

      value:
        string
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
      product:
        Product
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
     SHIPPING INPUT
     ========================================================= */

  const updateShippingField =
    (
      id:
        number,

      field:
        | 'min_distance'
        | 'max_distance'
        | 'fee',

      value:
        string
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
      id:
        number
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
     UPDATE ORDER STATUS
     ========================================================= */

  const updateOrderStatus =
    async (
      order:
        AdminOrder,

      status:
        string
    ) => {

      setUpdatingOrderNumber(
        order.order_number
      );


      setMessage(
        ''
      );


      setError(
        ''
      );


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/orders/${encodeURIComponent(
              order.order_number
            )}/status`,
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
                  status
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
            result?.details ||
            'Gagal mengubah status pesanan.'
          );
        }


        if (
          status ===
          'ready'
        ) {

          setMessage(
            `${order.order_number}: Pesanan ditandai sudah siap.`
          );

        } else if (
          status ===
          'completed'
        ) {

          setMessage(
            `${order.order_number}: Pesanan selesai dan masuk ke riwayat.`
          );

        } else {

          setMessage(
            `${order.order_number}: Status berhasil diperbarui.`
          );
        }


        await loadOrders(
          true
        );


      } catch (
        err
      ) {

        console.error(
          'Update order status error:',
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : 'Gagal mengubah status pesanan.'
        );


      } finally {

        setUpdatingOrderNumber(
          null
        );

      }
    };


  /* =========================================================
     DELETE ORDER
     ========================================================= */

  const deleteOrder =
    async (
      order:
        AdminOrder
    ) => {

      const confirmed =
        window.confirm(
          `Hapus pesanan ${order.order_number}?\n\nPesanan ini akan dihapus permanen.`
        );


      if (
        !confirmed
      ) {

        return;
      }


      setDeletingOrderNumber(
        order.order_number
      );


      setMessage(
        ''
      );


      setError(
        ''
      );


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/orders/${encodeURIComponent(
              order.order_number
            )}`,
            {
              method:
                'DELETE',

              headers: {
                'X-ADMIN-SECRET':
                  secret
              }
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
            result?.details ||
            'Gagal menghapus pesanan.'
          );
        }


        /*
         * Hapus langsung dari UI
         * supaya terasa instan.
         */

        setOrders(
          current =>
            current.filter(
              item =>
                item.order_number !==
                order.order_number
            )
        );


        setMessage(
          `${order.order_number}: Pesanan berhasil dihapus.`
        );


        /*
         * Sinkron ulang database.
         */

        await loadOrders(
          true
        );


      } catch (
        err
      ) {

        console.error(
          'Delete order error:',
          err
        );


        setError(
          err instanceof Error
            ? err.message
            : 'Gagal menghapus pesanan.'
        );


      } finally {

        setDeletingOrderNumber(
          null
        );

      }
    };


  /* =========================================================
     ORDER STATUS DISPLAY
     ========================================================= */

  const getOrderStatusUI =
    (
      status:
        string
    ) => {

      const normalized =
        String(
          status ||
          'pending'
        )
          .trim()
          .toLowerCase();


      if (
        normalized ===
        'paid'
      ) {

        return {
          label:
            'Sedang Disiapkan',

          className:
            'bg-amber-950/40 border-amber-500/30 text-amber-300',

          icon:
            Coffee
        };
      }


      if (
        normalized ===
        'ready'
      ) {

        return {
          label:
            'Sudah Siap',

          className:
            'bg-blue-950/40 border-blue-500/30 text-blue-300',

          icon:
            PackageCheck
        };
      }


      if (
        normalized ===
        'completed'
      ) {

        return {
          label:
            'Selesai',

          className:
            'bg-emerald-950/40 border-emerald-500/30 text-emerald-300',

          icon:
            CheckCircle2
        };
      }


      if (
        normalized ===
        'failed'
      ) {

        return {
          label:
            'Pembayaran Gagal',

          className:
            'bg-red-950/40 border-red-500/30 text-red-300',

          icon:
            XCircle
        };
      }


      if (
        normalized ===
        'refunded'
      ) {

        return {
          label:
            'Refund',

          className:
            'bg-purple-950/40 border-purple-500/30 text-purple-300',

          icon:
            RefreshCcw
        };
      }


      return {
        label:
          'Menunggu Pembayaran',

        className:
          'bg-[#1b1712] border-[#4a3e32] text-[#b8ab9e]',

        icon:
          Clock3
      };
    };


  /* =========================================================
     ORDER FILTERS
     ========================================================= */

  const activeOrders =
    orders.filter(
      order =>
        order.status ===
          'paid' ||
        order.status ===
          'ready'
    );


  const pendingOrders =
    orders.filter(
      order =>
        order.status ===
        'pending'
    );


  const historyOrders =
    orders.filter(
      order =>
        order.status ===
          'completed' ||
        order.status ===
          'failed' ||
        order.status ===
          'refunded'
    );


  const preparingOrders =
    activeOrders.filter(
      order =>
        order.status ===
        'paid'
    ).length;


  const readyOrders =
    activeOrders.filter(
      order =>
        order.status ===
        'ready'
    ).length;


  const visibleOrders =
    orderFilter ===
    'active'
      ? activeOrders
      : orderFilter ===
        'pending'
        ? pendingOrders
        : historyOrders;


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

    <div
      className="
        min-h-screen
        bg-[#0a0806]
        text-[#f3ece2]
      "
    >


      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="
          border-b
          border-[#30261e]
          bg-[#100c09]
          sticky
          top-0
          z-20
        "
      >

        <div
          className="
            max-w-6xl
            mx-auto
            px-4
            py-4
            flex
            items-center
            justify-between
            gap-4
          "
        >


          <div>

            <p
              className="
                text-[#d4af37]
                text-xs
                tracking-[0.25em]
                uppercase
              "
            >
              Arume Coffee
            </p>


            <h1
              className="
                text-xl
                sm:text-2xl
                font-bold
              "
            >
              Admin Panel
            </h1>

          </div>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >


            <button
              onClick={
                loadAll
              }
              className="
                p-3
                rounded-xl
                border
                border-[#3b3026]
                hover:border-[#d4af37]
                transition
              "
              title="Refresh"
            >

              <RefreshCcw
                className="
                  w-5
                  h-5
                "
              />

            </button>


            <button
              onClick={
                logout
              }
              className="
                flex
                items-center
                gap-2
                px-4
                py-3
                rounded-xl
                bg-red-950/30
                border
                border-red-500/30
                text-red-300
                hover:bg-red-950/50
                transition
              "
            >

              <LogOut
                className="
                  w-4
                  h-4
                "
              />


              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Keluar
              </span>

            </button>


          </div>

        </div>


        {/* ===================================================
            MAIN TABS
            =================================================== */}

        <div
          className="
            max-w-6xl
            mx-auto
            px-4
          "
        >

          <div
            className="
              grid
              grid-cols-3
              gap-2
              pb-4
            "
          >


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'orders'
                )
              }
              className={`
                relative
                flex
                items-center
                justify-center
                gap-2
                py-3
                px-2
                rounded-xl
                border
                text-sm
                font-bold
                transition
                ${
                  activeTab ===
                  'orders'
                    ? 'bg-[#d4af37] border-[#d4af37] text-black'
                    : 'bg-[#17110d] border-[#382e25] text-[#bcae9f]'
                }
              `}
            >

              <ReceiptText
                className="
                  w-4
                  h-4
                "
              />

              <span>
                Pesanan
              </span>


              {activeOrders.length >
                0 && (

                <span
                  className={`
                    min-w-[20px]
                    h-5
                    px-1.5
                    rounded-full
                    text-[10px]
                    flex
                    items-center
                    justify-center
                    ${
                      activeTab ===
                      'orders'
                        ? 'bg-black text-[#d4af37]'
                        : 'bg-[#d4af37] text-black'
                    }
                  `}
                >
                  {activeOrders.length}
                </span>

              )}

            </button>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'stock'
                )
              }
              className={`
                flex
                items-center
                justify-center
                gap-2
                py-3
                px-2
                rounded-xl
                border
                text-sm
                font-bold
                transition
                ${
                  activeTab ===
                  'stock'
                    ? 'bg-[#d4af37] border-[#d4af37] text-black'
                    : 'bg-[#17110d] border-[#382e25] text-[#bcae9f]'
                }
              `}
            >

              <ShoppingBag
                className="
                  w-4
                  h-4
                "
              />

              Stok

            </button>


            <button
              type="button"
              onClick={() =>
                setActiveTab(
                  'shipping'
                )
              }
              className={`
                flex
                items-center
                justify-center
                gap-2
                py-3
                px-2
                rounded-xl
                border
                text-sm
                font-bold
                transition
                ${
                  activeTab ===
                  'shipping'
                    ? 'bg-[#d4af37] border-[#d4af37] text-black'
                    : 'bg-[#17110d] border-[#382e25] text-[#bcae9f]'
                }
              `}
            >

              <Truck
                className="
                  w-4
                  h-4
                "
              />

              Ongkir

            </button>


          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main
        className="
          max-w-6xl
          mx-auto
          px-4
          py-8
        "
      >


        {/* ===================================================
            MESSAGE
            =================================================== */}

        {message && (

          <div
            className="
              mb-5
              bg-emerald-950/30
              border
              border-emerald-500/30
              text-emerald-300
              rounded-xl
              px-4
              py-3
            "
          >
            {message}
          </div>

        )}


        {error && (

          <div
            className="
              mb-5
              bg-red-950/30
              border
              border-red-500/30
              text-red-300
              rounded-xl
              px-4
              py-3
            "
          >
            {error}
          </div>

        )}


        {/* ===================================================
            ORDERS TAB
            =================================================== */}

        {activeTab ===
          'orders' && (

          <section>


            <div
              className="
                mb-6
              "
            >

              <h2
                className="
                  text-3xl
                  font-bold
                "
              >
                Pesanan
              </h2>


              <p
                className="
                  text-[#ad9f91]
                  mt-1
                "
              >
                Pesanan diperbarui otomatis setiap 10 detik.
              </p>

            </div>


            {/* =================================================
                SUMMARY
                ================================================= */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                mb-5
              "
            >


              <div
                className="
                  rounded-2xl
                  border
                  border-amber-500/20
                  bg-amber-950/20
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-amber-300
                    mb-2
                  "
                >

                  <Coffee
                    className="
                      w-4
                      h-4
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                    "
                  >
                    Disiapkan
                  </span>

                </div>


                <p
                  className="
                    text-3xl
                    font-bold
                  "
                >
                  {preparingOrders}
                </p>

              </div>


              <div
                className="
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-blue-950/20
                  p-4
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-blue-300
                    mb-2
                  "
                >

                  <PackageCheck
                    className="
                      w-4
                      h-4
                    "
                  />

                  <span
                    className="
                      text-xs
                      font-bold
                      uppercase
                    "
                  >
                    Sudah Siap
                  </span>

                </div>


                <p
                  className="
                    text-3xl
                    font-bold
                  "
                >
                  {readyOrders}
                </p>

              </div>


            </div>


            {/* =================================================
                ORDER FILTER
                ================================================= */}

            <div
              className="
                grid
                grid-cols-3
                gap-2
                mb-7
              "
            >


              <button
                type="button"
                onClick={() =>
                  setOrderFilter(
                    'active'
                  )
                }
                className={`
                  rounded-xl
                  border
                  px-2
                  py-3
                  text-xs
                  sm:text-sm
                  font-bold
                  transition
                  ${
                    orderFilter ===
                    'active'
                      ? 'bg-[#d4af37] border-[#d4af37] text-black'
                      : 'bg-[#13100d] border-[#302820] text-[#ad9f91]'
                  }
                `}
              >
                Aktif ({activeOrders.length})
              </button>


              <button
                type="button"
                onClick={() =>
                  setOrderFilter(
                    'pending'
                  )
                }
                className={`
                  rounded-xl
                  border
                  px-2
                  py-3
                  text-xs
                  sm:text-sm
                  font-bold
                  transition
                  ${
                    orderFilter ===
                    'pending'
                      ? 'bg-[#d4af37] border-[#d4af37] text-black'
                      : 'bg-[#13100d] border-[#302820] text-[#ad9f91]'
                  }
                `}
              >
                Belum Bayar ({pendingOrders.length})
              </button>


              <button
                type="button"
                onClick={() =>
                  setOrderFilter(
                    'history'
                  )
                }
                className={`
                  rounded-xl
                  border
                  px-2
                  py-3
                  text-xs
                  sm:text-sm
                  font-bold
                  transition
                  ${
                    orderFilter ===
                    'history'
                      ? 'bg-[#d4af37] border-[#d4af37] text-black'
                      : 'bg-[#13100d] border-[#302820] text-[#ad9f91]'
                  }
                `}
              >
                Riwayat ({historyOrders.length})
              </button>


            </div>


            {/* =================================================
                ORDER LIST
                ================================================= */}

            {ordersLoading ? (

              <div
                className="
                  text-center
                  py-20
                  text-[#a89b8d]
                "
              >
                Memuat pesanan...
              </div>

            ) : visibleOrders.length ===
              0 ? (

              <div
                className="
                  bg-[#13100d]
                  border
                  border-[#302820]
                  rounded-2xl
                  p-10
                  text-center
                "
              >

                <ReceiptText
                  className="
                    w-10
                    h-10
                    text-[#625548]
                    mx-auto
                    mb-4
                  "
                />


                <p
                  className="
                    font-bold
                    text-lg
                  "
                >

                  {orderFilter ===
                  'active'
                    ? 'Tidak ada pesanan aktif'
                    : orderFilter ===
                      'pending'
                      ? 'Tidak ada pesanan menunggu pembayaran'
                      : 'Belum ada riwayat pesanan'}

                </p>


                <p
                  className="
                    text-sm
                    text-[#8f8377]
                    mt-1
                  "
                >

                  {orderFilter ===
                  'active'
                    ? 'Pesanan yang sudah dibayar akan muncul di sini.'
                    : orderFilter ===
                      'pending'
                      ? 'Order yang belum dibayar akan muncul di sini.'
                      : 'Pesanan selesai, gagal, atau refund akan tersimpan di sini.'}

                </p>

              </div>

            ) : (

              <div
                className="
                  space-y-4
                "
              >


                {visibleOrders.map(
                  order => {

                    const statusUI =
                      getOrderStatusUI(
                        order.status
                      );


                    const StatusIcon =
                      statusUI.icon;


                    const isUpdating =
                      updatingOrderNumber ===
                      order.order_number;


                    const isDeleting =
                      deletingOrderNumber ===
                      order.order_number;


                    const isDelivery =
                      order.delivery_type ===
                      'delivery';


                    return (

                      <div
                        key={
                          order.order_number
                        }
                        className="
                          bg-[#13100d]
                          border
                          border-[#302820]
                          rounded-2xl
                          overflow-hidden
                        "
                      >


                        {/* =====================================
                            ORDER HEADER
                            ===================================== */}

                        <div
                          className="
                            p-5
                            border-b
                            border-[#282018]
                          "
                        >

                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-3
                            "
                          >


                            <div>

                              <p
                                className="
                                  text-[10px]
                                  text-[#8f8377]
                                  uppercase
                                  tracking-widest
                                "
                              >
                                Nomor Pesanan
                              </p>


                              <p
                                className="
                                  font-mono
                                  font-bold
                                  text-[#d4af37]
                                  mt-1
                                  break-all
                                "
                              >
                                {order.order_number}
                              </p>


                              <p
                                className="
                                  text-xs
                                  text-[#76695e]
                                  mt-1
                                "
                              >
                                {formatDate(
                                  order.created_at
                                )}
                              </p>

                            </div>


                            <div
                              className={`
                                shrink-0
                                flex
                                items-center
                                gap-1.5
                                px-3
                                py-2
                                rounded-xl
                                border
                                text-xs
                                font-bold
                                ${statusUI.className}
                              `}
                            >

                              <StatusIcon
                                className="
                                  w-4
                                  h-4
                                "
                              />


                              <span
                                className="
                                  hidden
                                  sm:inline
                                "
                              >
                                {statusUI.label}
                              </span>

                            </div>


                          </div>

                        </div>


                        {/* =====================================
                            ORDER BODY
                            ===================================== */}

                        <div
                          className="
                            p-5
                            space-y-5
                          "
                        >


                          {/* CUSTOMER */}

                          <div>

                            <p
                              className="
                                text-xs
                                uppercase
                                tracking-wider
                                text-[#8f8377]
                                mb-2
                              "
                            >
                              Customer
                            </p>


                            <p
                              className="
                                font-bold
                                text-lg
                              "
                            >
                              {order.customer_name ||
                                'Customer'}
                            </p>


                            {order.customer_phone && (

                              <p
                                className="
                                  text-sm
                                  text-[#ad9f91]
                                  mt-1
                                "
                              >
                                {order.customer_phone}
                              </p>

                            )}


                            {order.customer_email && (

                              <p
                                className="
                                  text-sm
                                  text-[#817468]
                                "
                              >
                                {order.customer_email}
                              </p>

                            )}

                          </div>


                          {/* ITEMS */}

                          <div>

                            <p
                              className="
                                text-xs
                                uppercase
                                tracking-wider
                                text-[#8f8377]
                                mb-2
                              "
                            >
                              Pesanan
                            </p>


                            <div
                              className="
                                rounded-xl
                                bg-[#0b0806]
                                border
                                border-[#282018]
                                divide-y
                                divide-[#282018]
                              "
                            >


                              {order.items &&
                              order.items.length >
                                0 ? (

                                order.items.map(
                                  (
                                    item,
                                    index
                                  ) => (

                                    <div
                                      key={
                                        item.id ||
                                        `${order.order_number}-${index}`
                                      }
                                      className="
                                        px-4
                                        py-3
                                        flex
                                        items-center
                                        justify-between
                                        gap-4
                                      "
                                    >


                                      <div>

                                        <p
                                          className="
                                            text-sm
                                            font-semibold
                                          "
                                        >
                                          {item.product_name ||
                                            item.product_id ||
                                            'Produk'}
                                        </p>


                                        <p
                                          className="
                                            text-xs
                                            text-[#817468]
                                            mt-1
                                          "
                                        >
                                          {Number(
                                            item.quantity ||
                                            0
                                          )}{' '}
                                          x{' '}
                                          {formatPrice(
                                            Number(
                                              item.price ||
                                              0
                                            )
                                          )}
                                        </p>

                                      </div>


                                      <p
                                        className="
                                          text-sm
                                          font-bold
                                          text-[#d4af37]
                                        "
                                      >
                                        {formatPrice(
                                          Number(
                                            item.subtotal ||
                                            0
                                          )
                                        )}
                                      </p>


                                    </div>

                                  )
                                )

                              ) : (

                                <div
                                  className="
                                    px-4
                                    py-3
                                    text-sm
                                    text-[#817468]
                                  "
                                >
                                  Detail item tidak tersedia.
                                </div>

                              )}


                            </div>

                          </div>


                          {/* DELIVERY */}

                          <div
                            className="
                              rounded-xl
                              bg-[#0b0806]
                              border
                              border-[#282018]
                              p-4
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                gap-3
                              "
                            >

                              {isDelivery ? (

                                <Truck
                                  className="
                                    w-5
                                    h-5
                                    text-[#d4af37]
                                    shrink-0
                                  "
                                />

                              ) : (

                                <Store
                                  className="
                                    w-5
                                    h-5
                                    text-[#d4af37]
                                    shrink-0
                                  "
                                />

                              )}


                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    text-sm
                                    font-bold
                                  "
                                >
                                  {isDelivery
                                    ? 'Delivery'
                                    : 'Ambil Sendiri'}
                                </p>


                                {isDelivery &&
                                order.delivery_address && (

                                  <div
                                    className="
                                      flex
                                      gap-1.5
                                      mt-2
                                      text-xs
                                      text-[#9d9083]
                                    "
                                  >

                                    <MapPin
                                      className="
                                        w-3.5
                                        h-3.5
                                        shrink-0
                                        mt-0.5
                                      "
                                    />


                                    <span>
                                      {order.delivery_address}
                                    </span>

                                  </div>

                                )}


                                {isDelivery &&
                                order.delivery_distance_km !==
                                  null &&
                                order.delivery_distance_km !==
                                  undefined && (

                                  <p
                                    className="
                                      text-xs
                                      text-[#76695e]
                                      mt-2
                                    "
                                  >
                                    Jarak:{' '}
                                    {order.delivery_distance_km}{' '}
                                    KM
                                  </p>

                                )}

                              </div>

                            </div>

                          </div>


                          {/* NOTES */}

                          {order.notes && (

                            <div>

                              <p
                                className="
                                  text-xs
                                  uppercase
                                  tracking-wider
                                  text-[#8f8377]
                                  mb-2
                                "
                              >
                                Catatan
                              </p>


                              <div
                                className="
                                  rounded-xl
                                  border
                                  border-[#382d24]
                                  bg-[#17110d]
                                  px-4
                                  py-3
                                  text-sm
                                  text-[#c5b8aa]
                                "
                              >
                                {order.notes}
                              </div>

                            </div>

                          )}


                          {/* TOTAL */}

                          <div
                            className="
                              border-t
                              border-[#282018]
                              pt-4
                              space-y-2
                            "
                          >


                            <div
                              className="
                                flex
                                justify-between
                                text-sm
                              "
                            >

                              <span
                                className="
                                  text-[#817468]
                                "
                              >
                                Subtotal
                              </span>


                              <span>
                                {formatPrice(
                                  Number(
                                    order.subtotal_amount ||
                                    0
                                  )
                                )}
                              </span>

                            </div>


                            {Number(
                              order.shipping_fee ||
                              0
                            ) >
                              0 && (

                              <div
                                className="
                                  flex
                                  justify-between
                                  text-sm
                                "
                              >

                                <span
                                  className="
                                    text-[#817468]
                                  "
                                >
                                  Ongkir
                                </span>


                                <span>
                                  {formatPrice(
                                    Number(
                                      order.shipping_fee ||
                                      0
                                    )
                                  )}
                                </span>

                              </div>

                            )}


                            <div
                              className="
                                flex
                                justify-between
                                items-end
                                pt-2
                              "
                            >

                              <span
                                className="
                                  font-bold
                                "
                              >
                                Total
                              </span>


                              <span
                                className="
                                  text-xl
                                  font-bold
                                  text-[#d4af37]
                                "
                              >
                                {formatPrice(
                                  Number(
                                    order.total_amount ||
                                    0
                                  )
                                )}
                              </span>

                            </div>

                          </div>


                          {/* =====================================
                              PAID
                              ===================================== */}

                          {order.status ===
                            'paid' && (

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(
                                  order,
                                  'ready'
                                )
                              }
                              disabled={
                                isUpdating
                              }
                              className="
                                w-full
                                py-3.5
                                rounded-xl
                                bg-[#d4af37]
                                text-black
                                font-bold
                                flex
                                items-center
                                justify-center
                                gap-2
                                hover:bg-[#e2c256]
                                disabled:opacity-50
                                transition
                              "
                            >

                              {isUpdating ? (

                                <RefreshCcw
                                  className="
                                    w-5
                                    h-5
                                    animate-spin
                                  "
                                />

                              ) : (

                                <PackageCheck
                                  className="
                                    w-5
                                    h-5
                                  "
                                />

                              )}


                              {isUpdating
                                ? 'Memproses...'
                                : 'Pesanan Sudah Siap'}

                            </button>

                          )}


                          {/* =====================================
                              READY
                              ===================================== */}

                          {order.status ===
                            'ready' && (

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(
                                  order,
                                  'completed'
                                )
                              }
                              disabled={
                                isUpdating
                              }
                              className="
                                w-full
                                py-3.5
                                rounded-xl
                                bg-emerald-600
                                text-white
                                font-bold
                                flex
                                items-center
                                justify-center
                                gap-2
                                hover:bg-emerald-500
                                disabled:opacity-50
                                transition
                              "
                            >

                              {isUpdating ? (

                                <RefreshCcw
                                  className="
                                    w-5
                                    h-5
                                    animate-spin
                                  "
                                />

                              ) : (

                                <Check
                                  className="
                                    w-5
                                    h-5
                                  "
                                />

                              )}


                              {isUpdating
                                ? 'Memproses...'
                                : 'Selesaikan Pesanan'}

                            </button>

                          )}


                          {/* =====================================
                              COMPLETED
                              ===================================== */}

                          {order.status ===
                            'completed' && (

                            <div
                              className="
                                rounded-xl
                                bg-emerald-950/30
                                border
                                border-emerald-500/30
                                text-emerald-300
                                py-3
                                flex
                                items-center
                                justify-center
                                gap-2
                                font-bold
                              "
                            >

                              <CheckCircle2
                                className="
                                  w-5
                                  h-5
                                "
                              />

                              Pesanan Selesai

                            </div>

                          )}


                          {/* =====================================
                              PENDING
                              ===================================== */}

                          {order.status ===
                            'pending' && (

                            <div
                              className="
                                space-y-3
                              "
                            >

                              <div
                                className="
                                  rounded-xl
                                  bg-[#17120e]
                                  border
                                  border-[#3e342b]
                                  text-[#b8ab9e]
                                  py-3
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                  font-semibold
                                "
                              >

                                <Clock3
                                  className="
                                    w-5
                                    h-5
                                  "
                                />

                                Menunggu Pembayaran

                              </div>


                              <button
                                type="button"
                                onClick={() =>
                                  deleteOrder(
                                    order
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="
                                  w-full
                                  py-3
                                  rounded-xl
                                  bg-red-950/30
                                  border
                                  border-red-500/30
                                  text-red-300
                                  font-bold
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                  hover:bg-red-950/50
                                  disabled:opacity-50
                                  transition
                                "
                              >

                                {isDeleting ? (

                                  <RefreshCcw
                                    className="
                                      w-5
                                      h-5
                                      animate-spin
                                    "
                                  />

                                ) : (

                                  <Trash2
                                    className="
                                      w-5
                                      h-5
                                    "
                                  />

                                )}


                                {isDeleting
                                  ? 'Menghapus...'
                                  : 'Hapus Pesanan'}

                              </button>

                            </div>

                          )}


                          {/* =====================================
                              FAILED
                              ===================================== */}

                          {order.status ===
                            'failed' && (

                            <div
                              className="
                                space-y-3
                              "
                            >

                              <div
                                className="
                                  rounded-xl
                                  bg-red-950/30
                                  border
                                  border-red-500/30
                                  text-red-300
                                  py-3
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                  font-semibold
                                "
                              >

                                <XCircle
                                  className="
                                    w-5
                                    h-5
                                  "
                                />

                                Pembayaran Gagal

                              </div>


                              <button
                                type="button"
                                onClick={() =>
                                  deleteOrder(
                                    order
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                className="
                                  w-full
                                  py-3
                                  rounded-xl
                                  bg-red-950/30
                                  border
                                  border-red-500/30
                                  text-red-300
                                  font-bold
                                  flex
                                  items-center
                                  justify-center
                                  gap-2
                                  hover:bg-red-950/50
                                  disabled:opacity-50
                                  transition
                                "
                              >

                                {isDeleting ? (

                                  <RefreshCcw
                                    className="
                                      w-5
                                      h-5
                                      animate-spin
                                    "
                                  />

                                ) : (

                                  <Trash2
                                    className="
                                      w-5
                                      h-5
                                    "
                                  />

                                )}


                                {isDeleting
                                  ? 'Menghapus...'
                                  : 'Hapus Pesanan'}

                              </button>

                            </div>

                          )}


                          {/* =====================================
                              REFUNDED
                              ===================================== */}

                          {order.status ===
                            'refunded' && (

                            <div
                              className="
                                rounded-xl
                                bg-purple-950/30
                                border
                                border-purple-500/30
                                text-purple-300
                                py-3
                                flex
                                items-center
                                justify-center
                                gap-2
                                font-semibold
                              "
                            >

                              <RefreshCcw
                                className="
                                  w-5
                                  h-5
                                "
                              />

                              Pembayaran Dikembalikan

                            </div>

                          )}


                        </div>

                      </div>

                    );
                  }
                )}


              </div>

            )}

          </section>

        )}


        {/* ===================================================
            STOCK TAB
            =================================================== */}

        {activeTab ===
          'stock' && (

          <section>


            <div
              className="
                mb-7
              "
            >

              <h2
                className="
                  text-3xl
                  font-bold
                "
              >
                Stok Produk
              </h2>


              <p
                className="
                  text-[#ad9f91]
                  mt-1
                "
              >
                Ubah jumlah stok lalu tekan Simpan pada produk.
              </p>

            </div>


            {loading ? (

              <div
                className="
                  text-center
                  py-20
                  text-[#a89b8d]
                "
              >
                Memuat produk...
              </div>

            ) : (

              <div
                className="
                  grid
                  md:grid-cols-2
                  gap-4
                "
              >


                {products.map(
                  product => (

                    <div
                      key={
                        product.id
                      }
                      className="
                        bg-[#13100d]
                        border
                        border-[#302820]
                        rounded-2xl
                        p-5
                      "
                    >


                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                          mb-5
                        "
                      >


                        <div>

                          <p
                            className="
                              text-xs
                              text-[#d4af37]
                              uppercase
                              tracking-wider
                              mb-1
                            "
                          >

                            {product.category ||
                              'Produk'}

                          </p>


                          <h3
                            className="
                              text-lg
                              font-bold
                            "
                          >
                            {product.name}
                          </h3>


                          <p
                            className="
                              text-sm
                              text-[#a89b8d]
                              mt-1
                            "
                          >
                            {formatPrice(
                              Number(
                                product.price
                              )
                            )}
                          </p>

                        </div>


                        <div
                          className="
                            text-right
                          "
                        >

                          <p
                            className="
                              text-xs
                              text-[#8f8377]
                            "
                          >
                            ID
                          </p>


                          <p
                            className="
                              font-mono
                              text-xs
                              text-[#b8ab9e]
                            "
                          >
                            {product.id}
                          </p>

                        </div>


                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >


                        <button
                          onClick={() =>
                            changeStock(
                              product.id,
                              -1
                            )
                          }
                          className="
                            w-11
                            h-11
                            rounded-xl
                            border
                            border-[#44372c]
                            flex
                            items-center
                            justify-center
                            hover:border-[#d4af37]
                            transition
                          "
                        >

                          <Minus
                            className="
                              w-4
                              h-4
                            "
                          />

                        </button>


                        <input
                          type="number"
                          min="0"
                          value={
                            product.stock
                          }
                          onChange={
                            e =>
                              handleStockInput(
                                product.id,
                                e.target.value
                              )
                          }
                          className="
                            flex-1
                            min-w-0
                            text-center
                            text-xl
                            font-bold
                            bg-[#090705]
                            border
                            border-[#44372c]
                            rounded-xl
                            h-11
                            outline-none
                            focus:border-[#d4af37]
                          "
                        />


                        <button
                          onClick={() =>
                            changeStock(
                              product.id,
                              1
                            )
                          }
                          className="
                            w-11
                            h-11
                            rounded-xl
                            border
                            border-[#44372c]
                            flex
                            items-center
                            justify-center
                            hover:border-[#d4af37]
                            transition
                          "
                        >

                          <Plus
                            className="
                              w-4
                              h-4
                            "
                          />

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
                        className="
                          mt-4
                          w-full
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-[#d4af37]
                          hover:bg-[#e2c256]
                          disabled:opacity-50
                          text-black
                          font-bold
                          rounded-xl
                          py-3
                          transition
                        "
                      >

                        <Save
                          className="
                            w-4
                            h-4
                          "
                        />


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

        )}


        {/* ===================================================
            SHIPPING TAB
            =================================================== */}

        {activeTab ===
          'shipping' && (

          <section>


            <div
              className="
                mb-7
                flex
                items-start
                gap-4
              "
            >


              <div
                className="
                  w-12
                  h-12
                  shrink-0
                  rounded-2xl
                  bg-[#d4af37]/10
                  border
                  border-[#d4af37]/30
                  flex
                  items-center
                  justify-center
                "
              >

                <Truck
                  className="
                    w-6
                    h-6
                    text-[#d4af37]
                  "
                />

              </div>


              <div>

                <h2
                  className="
                    text-3xl
                    font-bold
                  "
                >
                  Pengaturan Ongkir
                </h2>


                <p
                  className="
                    text-[#ad9f91]
                    mt-1
                  "
                >
                  Atur tarif pengiriman berdasarkan jarak dari Arume Coffee.
                </p>

              </div>

            </div>


            {shippingLoading ? (

              <div
                className="
                  text-center
                  py-16
                  text-[#a89b8d]
                "
              >
                Memuat tarif ongkir...
              </div>

            ) : shippingRates.length ===
              0 ? (

              <div
                className="
                  bg-[#13100d]
                  border
                  border-[#302820]
                  rounded-2xl
                  p-6
                  text-[#ad9f91]
                "
              >
                Belum ada tarif ongkir.
              </div>

            ) : (

              <div
                className="
                  grid
                  md:grid-cols-2
                  gap-4
                "
              >


                {shippingRates.map(
                  rate => (

                    <div
                      key={
                        rate.id
                      }
                      className="
                        bg-[#13100d]
                        border
                        border-[#302820]
                        rounded-2xl
                        p-5
                      "
                    >


                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-4
                          mb-5
                        "
                      >


                        <div>

                          <p
                            className="
                              text-xs
                              text-[#d4af37]
                              uppercase
                              tracking-wider
                            "
                          >
                            Zona Pengiriman
                          </p>


                          <h3
                            className="
                              text-lg
                              font-bold
                              mt-1
                            "
                          >

                            {rate.min_distance}{' '}
                            KM
                            {' — '}
                            {rate.max_distance}{' '}
                            KM

                          </h3>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            toggleShippingActive(
                              rate.id
                            )
                          }
                          className={`
                            px-3
                            py-2
                            rounded-xl
                            border
                            text-xs
                            font-bold
                            transition
                            ${
                              rate.active
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-950/30 border-red-500/30 text-red-300'
                            }
                          `}
                        >

                          {rate.active
                            ? 'AKTIF'
                            : 'NONAKTIF'}

                        </button>


                      </div>


                      <div
                        className="
                          grid
                          grid-cols-2
                          gap-3
                          mb-3
                        "
                      >


                        <div>

                          <label
                            className="
                              text-xs
                              text-[#a89b8d]
                              block
                              mb-2
                            "
                          >
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
                            className="
                              w-full
                              bg-[#090705]
                              border
                              border-[#44372c]
                              rounded-xl
                              h-11
                              px-3
                              outline-none
                              focus:border-[#d4af37]
                            "
                          />

                        </div>


                        <div>

                          <label
                            className="
                              text-xs
                              text-[#a89b8d]
                              block
                              mb-2
                            "
                          >
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
                            className="
                              w-full
                              bg-[#090705]
                              border
                              border-[#44372c]
                              rounded-xl
                              h-11
                              px-3
                              outline-none
                              focus:border-[#d4af37]
                            "
                          />

                        </div>


                      </div>


                      <div>

                        <label
                          className="
                            text-xs
                            text-[#a89b8d]
                            block
                            mb-2
                          "
                        >
                          Tarif Ongkir
                        </label>


                        <div
                          className="
                            relative
                          "
                        >

                          <span
                            className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              text-[#d4af37]
                              font-bold
                            "
                          >
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
                            className="
                              w-full
                              bg-[#090705]
                              border
                              border-[#44372c]
                              rounded-xl
                              h-12
                              pl-12
                              pr-4
                              text-lg
                              font-bold
                              outline-none
                              focus:border-[#d4af37]
                            "
                          />

                        </div>


                        <p
                          className="
                            text-sm
                            text-[#8f8377]
                            mt-2
                          "
                        >
                          {formatPrice(
                            Number(
                              rate.fee
                            )
                          )}
                        </p>

                      </div>


                      <button
                        onClick={() =>
                          saveShippingRate(
                            rate
                          )
                        }
                        disabled={
                          savingShippingId ===
                          rate.id
                        }
                        className="
                          mt-5
                          w-full
                          flex
                          items-center
                          justify-center
                          gap-2
                          bg-[#d4af37]
                          hover:bg-[#e2c256]
                          disabled:opacity-50
                          text-black
                          font-bold
                          rounded-xl
                          py-3
                          transition
                        "
                      >

                        <Save
                          className="
                            w-4
                            h-4
                          "
                        />


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


            <div
              className="
                mt-5
                rounded-2xl
                border
                border-[#302820]
                bg-[#100c09]
                px-5
                py-4
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-[#d4af37]
                "
              >
                Cara kerja tarif
              </p>


              <p
                className="
                  text-sm
                  text-[#a89b8d]
                  mt-1
                "
              >

                Sistem akan memilih zona berdasarkan jarak pelanggan.
                Tarif yang dinonaktifkan tidak akan digunakan saat checkout.

              </p>

            </div>


          </section>

        )}


      </main>


    </div>

  );
                                    }
