import React, { useRef, useState } from 'react';
import {
  X,
  Coffee,
  ShoppingBag,
  Send,
  Plus,
  Minus,
  Star,
  Heart,
  CreditCard,
  Loader2,
} from 'lucide-react';

import { CoffeeMenuItem } from '../types';
import { CONTACT_INFO } from '../data/coffeeData';

declare global {
  interface Window {
    snap: any;
  }
}

interface OrderModalProps {
  item: CoffeeMenuItem | null;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  item,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState('Es Normal');
  const [sugarLevel, setSugarLevel] = useState('Gula Normal');
  const [notes, setNotes] = useState('');

  // ================================
  // CUSTOMER DATA
  // ================================

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // ================================
  // LOADING STATE
  // ================================

  const [loading, setLoading] = useState(false);

  // ================================
  // CHECKOUT IDEMPOTENCY
  // ================================
  //
  // Satu checkout = satu checkout_id.
  //
  // Kalau user double click / request retry,
  // checkout_id tetap sama.
  //
  // Backend + Supabase akan mengenali
  // request tersebut sebagai transaksi yang sama.

  const checkoutIdRef = useRef<string | null>(null);

  if (!item) return null;

  const totalPrice = item.price * quantity;

  const formattedTotalPrice =
    `Rp${totalPrice.toLocaleString('id-ID')}`;

  // ================================
  // HANDLER CHECKOUT MIDTRANS
  // ================================

  const handleCheckoutMidtrans = async () => {
    // ================================
    // VALIDASI CUSTOMER
    // ================================

    if (!customerName || !customerEmail) {
      alert(
        'Mohon isi nama dan email Anda terlebih dahulu.'
      );

      return;
    }

    // ================================
    // ANTI DOUBLE CLICK
    // ================================

    if (loading) {
      return;
    }

    // ================================
    // GENERATE CHECKOUT ID
    // ================================
    //
    // Hanya dibuat sekali untuk proses
    // checkout yang sedang berjalan.

    if (!checkoutIdRef.current) {
      checkoutIdRef.current =
        crypto.randomUUID();
    }

    const checkoutId =
      checkoutIdRef.current;

    setLoading(true);

    try {
      // ================================
      // CREATE ORDER VIA API
      // ================================

      const response = await fetch(
        'https://arume-coffee-api-2.diyanaxl.workers.dev/api/orders',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            // Anti duplicate order
            'Idempotency-Key':
              checkoutId,
          },

          body: JSON.stringify({
            // Kirim juga di body
            checkout_id:
              checkoutId,

            customer: {
              name:
                customerName,

              email:
                customerEmail,

              phone:
                customerPhone ||
                '081234567890',
            },

            items: [
              {
                // Tidak pakai fallback prod-01.
                // Kalau ID salah, backend akan menolak.
                product_id:
                  item.id,

                quantity:
                  quantity,
              },
            ],

            notes:
              `${iceLevel}, ${sugarLevel}${
                notes
                  ? ` - ${notes}`
                  : ''
              }`,
          }),
        }
      );

      const result =
        await response.json();

      // ================================
      // MIDTRANS SNAP
      // ================================

      if (
        response.ok &&
        result.success &&
        result.data?.payment?.token
      ) {
        window.snap.pay(
          result.data.payment.token,
          {
            // ================================
            // PAYMENT SUCCESS
            // ================================

            onSuccess: function (
              res: any
            ) {
              alert(
                'Pembayaran Berhasil! Pesanan Anda sedang diproses.'
              );

              console.log(
                'Success:',
                res
              );

              // Checkout selesai.
              checkoutIdRef.current =
                null;

              onClose();
            },

            // ================================
            // PAYMENT PENDING
            // ================================

            onPending: function (
              res: any
            ) {
              alert(
                'Menunggu pembayaran diselesaikan.'
              );

              console.log(
                'Pending:',
                res
              );

              /*
               * Jangan reset checkoutIdRef
               * di sini.
               *
               * Order masih pending dan
               * mungkin payment akan dibuka
               * kembali.
               */

              onClose();
            },

            // ================================
            // PAYMENT ERROR
            // ================================

            onError: function (
              err: any
            ) {
              alert(
                'Pembayaran gagal, silakan coba lagi.'
              );

              console.error(
                'Error:',
                err
              );

              /*
               * Checkout ID tetap disimpan
               * supaya retry tidak membuat
               * order baru.
               */
            },

            // ================================
            // POPUP CLOSED
            // ================================

            onClose: function () {
              alert(
                'Anda membatalkan pembayaran.'
              );

              /*
               * Jangan reset checkout ID.
               *
               * Order sudah dibuat di database,
               * hanya pembayarannya belum selesai.
               */
            },
          }
        );
      } else {
        // ================================
        // API ERROR
        // ================================

        alert(
          'Gagal membuat pesanan: ' +
            (
              result.message ||
              result.error ||
              'Error Server'
            )
        );
      }

    } catch (error: any) {
      console.error(
        'Checkout error:',
        error
      );

      alert(
        'Terjadi kesalahan koneksi ke server API: ' +
          (
            error?.message ||
            error
          )
      );

      /*
       * Checkout ID tidak di-reset.
       *
       * Kalau request sebenarnya sudah
       * masuk API tetapi response terputus,
       * retry berikutnya tetap memakai
       * checkout_id yang sama.
       */

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        p-4
        bg-black/80
        backdrop-blur-md
        animate-in
        fade-in
        duration-300
      "
    >
      <div
        className="
          glass-card
          max-w-lg
          w-full
          rounded-3xl
          overflow-hidden
          border
          border-[#d4af37]/40
          shadow-2xl
          relative
          animate-in
          zoom-in-95
          duration-300
        "
      >

        {/* ================================
            CLOSE BUTTON
        ================================ */}

        <button
          onClick={onClose}
          disabled={loading}
          className="
            absolute
            top-4
            right-4
            z-20
            w-9
            h-9
            rounded-full
            bg-black/60
            border
            border-[#d4af37]/30
            text-white
            flex
            items-center
            justify-center
            hover:bg-[#d4af37]
            hover:text-black
            transition-colors
            disabled:opacity-40
            disabled:cursor-not-allowed
          "
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================================
            HEADER IMAGE
        ================================ */}

        <div
          className="
            relative
            h-48
            sm:h-56
            overflow-hidden
          "
        >
          <img
            src={item.image}
            alt={item.name}
            className="
              w-full
              h-full
              object-cover
            "
            referrerPolicy="no-referrer"
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-[#120e0b]
              via-[#120e0b]/40
              to-transparent
            "
          />

          <div
            className="
              absolute
              bottom-4
              left-6
              right-6
              flex
              items-end
              justify-between
            "
          >

            <div>
              <span
                className="
                  text-xs
                  px-2.5
                  py-1
                  rounded-md
                  bg-[#d4af37]
                  text-black
                  font-bold
                  uppercase
                  tracking-wider
                  mb-1
                  inline-block
                "
              >
                {item.category}
              </span>

              <h3
                className="
                  font-display
                  text-2xl
                  font-bold
                  text-white
                "
              >
                {item.name}
              </h3>
            </div>

            <div className="text-right">
              <span
                className="
                  text-xs
                  text-[#a09080]
                  block
                "
              >
                Harga Satuan
              </span>

              <span
                className="
                  font-display
                  text-2xl
                  font-bold
                  gold-gradient-text
                "
              >
                {item.formattedPrice}
              </span>
            </div>

          </div>
        </div>

        {/* ================================
            MODAL BODY
        ================================ */}

        <div
          className="
            p-6
            space-y-5
            max-h-[60vh]
            overflow-y-auto
          "
        >

          <p
            className="
              text-sm
              text-[#c2b4a3]
              font-light
              leading-relaxed
            "
          >
            {item.description}
          </p>

          {/* ================================
              CUSTOMER FORM
          ================================ */}

          <div
            className="
              space-y-3
              pt-2
              border-t
              border-[#2a2018]
            "
          >
            <span
              className="
                text-xs
                font-bold
                text-[#d4af37]
                uppercase
                tracking-wider
                block
              "
            >
              Informasi Pemesan
            </span>

            <div
              className="
                grid
                grid-cols-2
                gap-3
              "
            >

              <input
                type="text"
                placeholder="Nama Lengkap *"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(
                    e.target.value
                  )
                }
                disabled={loading}
                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3.5
                  py-2
                  text-sm
                  text-white
                  placeholder-[#605448]
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "
                required
              />

              <input
                type="email"
                placeholder="Email *"
                value={customerEmail}
                onChange={(e) =>
                  setCustomerEmail(
                    e.target.value
                  )
                }
                disabled={loading}
                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3.5
                  py-2
                  text-sm
                  text-white
                  placeholder-[#605448]
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "
                required
              />

            </div>

            <input
              type="tel"
              placeholder="Nomor WhatsApp"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(
                  e.target.value
                )
              }
              disabled={loading}
              className="
                w-full
                bg-[#18120d]
                border
                border-[#d4af37]/30
                rounded-xl
                px-3.5
                py-2
                text-sm
                text-white
                placeholder-[#605448]
                focus:outline-none
                focus:border-[#d4af37]
                disabled:opacity-50
              "
            />

          </div>

          {/* ================================
              QUANTITY
          ================================ */}

          <div
            className="
              flex
              items-center
              justify-between
              p-3.5
              rounded-2xl
              glass-panel
              border
              border-[#d4af37]/20
            "
          >
            <span
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              Jumlah Pesanan
            </span>

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(
                      1,
                      quantity - 1
                    )
                  )
                }
                disabled={loading}
                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-[#251c14]
                  border
                  border-[#d4af37]/30
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:border-[#d4af37]
                  disabled:opacity-40
                "
              >
                <Minus className="w-4 h-4" />
              </button>

              <span
                className="
                  font-bold
                  text-lg
                  text-white
                  min-w-[20px]
                  text-center
                "
              >
                {quantity}
              </span>

              <button
                onClick={() =>
                  setQuantity(
                    quantity + 1
                  )
                }
                disabled={loading}
                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-[#251c14]
                  border
                  border-[#d4af37]/30
                  text-white
                  flex
                  items-center
                  justify-center
                  hover:border-[#d4af37]
                  disabled:opacity-40
                "
              >
                <Plus className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* ================================
              ICE & SUGAR
          ================================ */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  text-[#b8a898]
                  uppercase
                  mb-1.5
                "
              >
                Level Es
              </label>

              <select
                value={iceLevel}
                onChange={(e) =>
                  setIceLevel(
                    e.target.value
                  )
                }
                disabled={loading}
                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  text-white
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "
              >
                <option value="Es Normal">
                  Es Normal
                </option>

                <option value="Less Ice">
                  Less Ice
                </option>

                <option value="No Ice">
                  No Ice
                </option>
              </select>
            </div>

            <div>
              <label
                className="
                  block
                  text-xs
                  font-semibold
                  text-[#b8a898]
                  uppercase
                  mb-1.5
                "
              >
                Level Gula
              </label>

              <select
                value={sugarLevel}
                onChange={(e) =>
                  setSugarLevel(
                    e.target.value
                  )
                }
                disabled={loading}
                className="
                  w-full
                  bg-[#18120d]
                  border
                  border-[#d4af37]/30
                  rounded-xl
                  px-3
                  py-2
                  text-sm
                  text-white
                  focus:outline-none
                  focus:border-[#d4af37]
                  disabled:opacity-50
                "
              >
                <option value="Gula Normal">
                  Normal
                </option>

                <option value="Less Sugar">
                  Less Sugar
                </option>

                <option value="Extra Sweet">
                  Extra Sweet
                </option>

                <option value="No Sugar">
                  No Sugar
                </option>
              </select>
            </div>

          </div>

          {/* ================================
              NOTES
          ================================ */}

          <div>
            <label
              className="
                block
                text-xs
                font-semibold
                text-[#b8a898]
                uppercase
                mb-1.5
              "
            >
              Catatan Pesanan
            </label>

            <input
              type="text"
              placeholder="Contoh: Pisahkan es / minta sedotan ramah lingkungan"
              value={notes}
              onChange={(e) =>
                setNotes(
                  e.target.value
                )
              }
              disabled={loading}
              className="
                w-full
                bg-[#18120d]
                border
                border-[#d4af37]/30
                rounded-xl
                px-3.5
                py-2
                text-sm
                text-white
                placeholder-[#605448]
                focus:outline-none
                focus:border-[#d4af37]
                disabled:opacity-50
              "
            />
          </div>

        </div>

        {/* ================================
            MODAL FOOTER
        ================================ */}

        <div
          className="
            p-6
            border-t
            border-[#2a2018]
            bg-[#120d09]/90
            flex
            items-center
            justify-between
            gap-4
          "
        >

          <div>
            <span
              className="
                text-[11px]
                text-[#8e8072]
                uppercase
                block
              "
            >
              Total Bayar
            </span>

            <span
              className="
                font-display
                text-2xl
                font-bold
                gold-gradient-text
              "
            >
              {formattedTotalPrice}
            </span>
          </div>

          {/* ================================
              PAY BUTTON
          ================================ */}

          <button
            onClick={
              handleCheckoutMidtrans
            }
            disabled={loading}
            className="
              gold-gradient-btn
              px-6
              py-3
              rounded-xl
              font-bold
              text-sm
              flex
              items-center
              gap-2
              shadow-lg
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <Loader2
                  className="
                    w-4
                    h-4
                    text-black
                    animate-spin
                  "
                />

                <span>
                  Memproses...
                </span>
              </>
            ) : (
              <>
                <CreditCard
                  className="
                    w-4
                    h-4
                    text-black
                  "
                />

                <span>
                  Bayar Sekarang
                </span>
              </>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
