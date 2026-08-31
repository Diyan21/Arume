import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CheckCircle2,
  Clock3,
  Coffee,
  PackageCheck,
  RefreshCcw,
  ShoppingBag,
  XCircle
} from 'lucide-react';


type OrderStatusData = {
  order_number: string;
  status: string;
  status_label?: string | null;
  subtotal_amount?: number;
  shipping_fee?: number;
  total_amount?: number;
  delivery_type?: string | null;
  created_at?: string | null;
  paid_at?: string | null;
  updated_at?: string | null;
};


type OrderStatusProps = {
  orderNumber: string;
  onClose: () => void;
};


const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';


export function OrderStatus({
  orderNumber,
  onClose
}: OrderStatusProps) {

  const [
    order,
    setOrder
  ] =
    useState<OrderStatusData | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );


  const [
    refreshing,
    setRefreshing
  ] =
    useState(
      false
    );


  const [
    error,
    setError
  ] =
    useState(
      ''
    );


  const formatPrice =
    (
      value:
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
          value ||
          0
        )
      );
    };


  const loadStatus =
    async (
      silent =
        false
    ) => {

      if (
        !silent
      ) {

        setLoading(
          true
        );

      } else {

        setRefreshing(
          true
        );
      }


      try {

        const response =
          await fetch(
            `${API_BASE_URL}/api/order-status/${encodeURIComponent(
              orderNumber
            )}`,
            {
              method:
                'GET',

              headers: {
                Accept:
                  'application/json'
              },

              cache:
                'no-store'
            }
          );


        const result =
          await response.json();


        if (
          !response.ok
        ) {

          throw new Error(
            result?.message ||
            result?.error ||
            'Gagal mengambil status pesanan.'
          );
        }


        const data =
          result?.data ||
          result;


        if (
          !data?.order_number
        ) {

          throw new Error(
            'Data pesanan tidak ditemukan.'
          );
        }


        setOrder({
          ...data,

          status:
            String(
              data.status ||
              'pending'
            )
              .trim()
              .toLowerCase(),

          subtotal_amount:
            Number(
              data.subtotal_amount ??
              0
            ),

          shipping_fee:
            Number(
              data.shipping_fee ??
              0
            ),

          total_amount:
            Number(
              data.total_amount ??
              0
            )
        });


        setError(
          ''
        );


      } catch (
        err
      ) {

        console.error(
          'Load order status error:',
          err
        );


        if (
          !silent
        ) {

          setError(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil status pesanan.'
          );
        }


      } finally {

        setLoading(
          false
        );

        setRefreshing(
          false
        );
      }
    };


  useEffect(
    () => {

      loadStatus();

    },
    [
      orderNumber
    ]
  );


  useEffect(
    () => {

      const interval =
        window.setInterval(
          () => {

            loadStatus(
              true
            );

          },
          5000
        );


      return () => {

        window.clearInterval(
          interval
        );
      };

    },
    [
      orderNumber
    ]
  );


  const visual =
    useMemo(
      () => {

        const status =
          String(
            order?.status ||
            'pending'
          )
            .trim()
            .toLowerCase();


        if (
          status ===
          'paid'
        ) {

          return {
            icon:
              Coffee,

            title:
              'Pesanan sedang disiapkan',

            description:
              'Pembayaran berhasil. Tim Arume Coffee sedang menyiapkan pesanan kamu.',

            className:
              'border-amber-500/30 bg-amber-950/20 text-amber-300'
          };
        }


        if (
          status ===
          'ready'
        ) {

          return {
            icon:
              PackageCheck,

            title:
              order?.delivery_type ===
              'delivery'
                ? 'Pesanan siap dikirim'
                : 'Pesanan sudah siap',

            description:
              order?.delivery_type ===
              'delivery'
                ? 'Pesanan kamu sudah selesai disiapkan dan siap untuk proses pengiriman.'
                : 'Pesanan kamu sudah selesai disiapkan dan siap diambil.',

            className:
              'border-blue-500/30 bg-blue-950/20 text-blue-300'
          };
        }


        if (
          status ===
          'completed'
        ) {

          return {
            icon:
              CheckCircle2,

            title:
              'Pesanan berhasil',

            description:
              'Pesanan telah selesai. Terima kasih sudah memesan di Arume Coffee.',

            className:
              'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
          };
        }


        if (
          status ===
          'failed'
        ) {

          return {
            icon:
              XCircle,

            title:
              'Pembayaran gagal',

            description:
              'Pembayaran belum berhasil diproses.',

            className:
              'border-red-500/30 bg-red-950/20 text-red-300'
          };
        }


        if (
          status ===
          'refunded'
        ) {

          return {
            icon:
              RefreshCcw,

            title:
              'Pembayaran dikembalikan',

            description:
              'Status pesanan ini telah direfund.',

            className:
              'border-purple-500/30 bg-purple-950/20 text-purple-300'
          };
        }


        return {
          icon:
            Clock3,

          title:
            'Menunggu konfirmasi pembayaran',

          description:
            'Sistem sedang mengecek pembayaran kamu. Status akan diperbarui otomatis.',

          className:
            'border-[#4c4034] bg-[#17120e] text-[#d6c8b8]'
        };

      },
      [
        order
      ]
    );


  const StatusIcon =
    visual.icon;


  if (
    loading &&
    !order
  ) {

    return (

      <div
        className="
          fixed
          inset-0
          z-[100]
          bg-[#080604]
          flex
          items-center
          justify-center
          px-4
        "
      >

        <div
          className="
            text-center
            text-[#d6c8b8]
          "
        >

          <RefreshCcw
            className="
              w-8
              h-8
              animate-spin
              mx-auto
              mb-4
              text-[#d4af37]
            "
          />

          Memuat status pesanan...

        </div>

      </div>

    );
  }


  return (

    <div
      className="
        fixed
        inset-0
        z-[100]
        overflow-y-auto
        bg-[#080604]
        text-[#f3ece2]
      "
    >

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          px-4
          py-10
        "
      >

        <div
          className="
            w-full
            max-w-lg
          "
        >


          <div
            className="
              text-center
              mb-7
            "
          >

            <div
              className="
                w-16
                h-16
                mx-auto
                rounded-2xl
                bg-[#d4af37]/10
                border
                border-[#d4af37]/30
                flex
                items-center
                justify-center
                mb-4
              "
            >

              <ShoppingBag
                className="
                  w-8
                  h-8
                  text-[#d4af37]
                "
              />

            </div>


            <p
              className="
                text-xs
                tracking-[0.28em]
                uppercase
                text-[#d4af37]
              "
            >
              Arume Coffee
            </p>


            <h1
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              Status Pesanan
            </h1>

          </div>


          {error && (

            <div
              className="
                mb-4
                rounded-xl
                border
                border-red-500/30
                bg-red-950/20
                text-red-300
                p-4
                text-sm
              "
            >

              {error}

            </div>

          )}


          <div
            className={`
              rounded-2xl
              border
              p-6
              ${visual.className}
            `}
          >

            <StatusIcon
              className="
                w-10
                h-10
                mb-4
              "
            />


            <h2
              className="
                text-2xl
                font-bold
              "
            >
              {visual.title}
            </h2>


            <p
              className="
                mt-2
                text-sm
                opacity-80
                leading-relaxed
              "
            >
              {visual.description}
            </p>

          </div>


          <div
            className="
              mt-4
              rounded-2xl
              border
              border-[#302820]
              bg-[#13100d]
              p-5
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                pb-4
                border-b
                border-[#2b231c]
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider
                    text-[#817468]
                  "
                >
                  Nomor Pesanan
                </p>


                <p
                  className="
                    mt-1
                    font-mono
                    font-bold
                    text-[#d4af37]
                    break-all
                  "
                >
                  {orderNumber}
                </p>

              </div>


              {refreshing && (

                <RefreshCcw
                  className="
                    w-4
                    h-4
                    animate-spin
                    text-[#817468]
                  "
                />

              )}

            </div>


            <div
              className="
                py-4
                space-y-2
              "
            >

              <div
                className="
                  flex
                  justify-between
                  gap-4
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
                      order?.subtotal_amount ||
                      0
                    )
                  )}
                </span>

              </div>


              {Number(
                order?.shipping_fee ||
                0
              ) >
                0 && (

                <div
                  className="
                    flex
                    justify-between
                    gap-4
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
                        order?.shipping_fee ||
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
                  gap-4
                  pt-3
                  border-t
                  border-[#2b231c]
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
                      order?.total_amount ||
                      0
                    )
                  )}
                </span>

              </div>

            </div>


            <p
              className="
                pt-4
                border-t
                border-[#2b231c]
                text-xs
                text-center
                text-[#77695e]
              "
            >
              Status diperbarui otomatis setiap 5 detik.
            </p>

          </div>


          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-3
            "
          >

            <button
              type="button"
              onClick={() =>
                loadStatus()
              }
              disabled={
                refreshing
              }
              className="
                rounded-xl
                border
                border-[#44372c]
                py-3
                font-bold
                flex
                items-center
                justify-center
                gap-2
                hover:border-[#d4af37]
                transition
              "
            >

              <RefreshCcw
                className={`
                  w-4
                  h-4
                  ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }
                `}
              />

              Refresh

            </button>


            <button
              type="button"
              onClick={
                onClose
              }
              className="
                rounded-xl
                bg-[#d4af37]
                text-black
                py-3
                font-bold
                hover:bg-[#e2c256]
                transition
              "
            >
              Kembali
            </button>

          </div>


        </div>

      </div>

    </div>

  );
}
