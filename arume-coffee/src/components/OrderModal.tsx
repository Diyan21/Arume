import React, { useRef, useState } from 'react';
import {
  X,
  Plus,
  Minus,
  CreditCard,
  Loader2,
} from 'lucide-react';

import { CoffeeMenuItem } from '../types';

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
  // Satu proses checkout = satu checkout_id.
  // Kalau user double click / retry request,
  // checkout_id tetap sama sehingga order
  // tidak dibuat berkali-kali.
  const checkoutIdRef = useRef<string | null>(null);

  if (!item) {
    return null;
  }

  const totalPrice = item.price * quantity;

  const formattedTotalPrice =
    `Rp${totalPrice.toLocaleString('id-ID')}`;

  // ================================
  // HANDLER CHECKOUT XENDIT
  // ================================
  const handleCheckoutXendit = async () => {
    // ================================
    // VALIDASI CUSTOMER
    // ================================
    if (!customerName.trim()) {
      alert('Mohon isi nama Anda terlebih dahulu.');
      return;
    }

    if (!customerEmail.trim()) {
      alert('Mohon isi email Anda terlebih dahulu.');
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
    if (!checkoutIdRef.current) {
      checkoutIdRef.current = crypto.randomUUID();
    }

    const checkoutId = checkoutIdRef.current;

    setLoading(true);

    try {
      // ==========================================
      // STEP 1
      // CREATE ORDER VIA ARUME API
      // ==========================================
      const orderResponse = await fetch(
        'https://arume-coffee-api-2.diyanaxl.workers.dev/api/orders',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            checkout_id: checkoutId,

            customer: {
              name: customerName.trim(),
              email: customerEmail.trim(),

              // Backend saat ini membutuhkan phone.
              // Kalau user tidak isi,
              // kirim fallback sementara.
              phone:
                customerPhone.trim() ||
                '081234567890',
            },

            items: [
              {
                product_id: item.id,
                quantity: quantity,
              },
            ],

            notes:
              `${iceLevel}, ${sugarLevel}${
                notes.trim()
                  ? ` - ${notes.trim()}`
                  : ''
              }`,
          }),
        }
      );

      // ==========================================
      // PARSE RESPONSE ORDER
      // ==========================================
      let orderResult: any;

      try {
        orderResult = await orderResponse.json();
      } catch {
        throw new Error(
          'Response dari server order tidak valid.'
        );
      }

      console.log(
        'Create order response:',
        orderResult
      );

      // ==========================================
      // VALIDASI CREATE ORDER
      // ==========================================
      if (
        !orderResponse.ok ||
        !orderResult?.success
      ) {
        throw new Error(
          orderResult?.message ||
            orderResult?.error ||
            'Gagal membuat pesanan.'
        );
      }

      // ==========================================
      // AMBIL ORDER NUMBER
      // ==========================================
      const orderNumber =
        orderResult?.data?.order_number ||
        orderResult?.data?.order?.order_number ||
        orderResult?.order_number ||
        orderResult?.order?.order_number;

      if (!orderNumber) {
        console.error(
          'Order number tidak ditemukan:',
          orderResult
        );

        throw new Error(
          'Pesanan berhasil dibuat, tetapi order_number tidak ditemukan.'
        );
      }

      console.log(
        'Order berhasil dibuat:',
        orderNumber
      );

      // ==========================================
      // STEP 2
      // CREATE XENDIT PAYMENT SESSION
      // ==========================================
      const paymentResponse = await fetch(
        'https://arume-coffee-api-2.diyanaxl.workers.dev/api/payment/create',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            order_number: orderNumber,
          }),
        }
      );

      // ==========================================
      // PARSE RESPONSE PAYMENT
      // ==========================================
      let paymentResult: any;

      try {
        paymentResult =
          await paymentResponse.json();
      } catch {
        throw new Error(
          'Response dari server pembayaran tidak valid.'
        );
      }

      console.log(
        'Create Xendit payment response:',
        paymentResult
      );

      // ==========================================
      // VALIDASI CREATE PAYMENT
      // ==========================================
      if (
        !paymentResponse.ok ||
        !paymentResult?.success
      ) {
        throw new Error(
          paymentResult?.message ||
            paymentResult?.error ||
            'Gagal membuat pembayaran Xendit.'
        );
      }

      // ==========================================
      // AMBIL PAYMENT URL XENDIT
      // ==========================================
      const paymentUrl =
        paymentResult?.data?.redirect_url ||
        paymentResult?.data?.payment_link_url ||
        paymentResult?.data?.payment_url ||

        paymentResult?.data?.payment?.redirect_url ||
        paymentResult?.data?.payment?.payment_link_url ||
        paymentResult?.data?.payment?.payment_url ||

        paymentResult?.redirect_url ||
        paymentResult?.payment_link_url ||
        paymentResult?.payment_url;

      if (!paymentUrl) {
        console.error(
          'Payment URL tidak ditemukan:',
          paymentResult
        );

        throw new Error(
          'Payment Xendit berhasil dibuat, tetapi payment URL tidak ditemukan.'
        );
      }

      console.log(
        'Redirect ke Xendit:',
        paymentUrl
      );

      // ==========================================
      // ORDER SUDAH BERHASIL
      // ==========================================
      // Reset checkout ID supaya transaksi
      // berikutnya membuat checkout baru.
      checkoutIdRef.current = null;

      // ==========================================
      // REDIRECT USER KE XENDIT CHECKOUT
      // ==========================================
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error(
        'Checkout Xendit error:',
        error
      );

      alert(
        'Gagal melanjutkan pembayaran: ' +
          (
            error?.message ||
            'Terjadi kesalahan pada server.'
          )
      );

      // Jangan reset checkoutIdRef di sini.
      //
      // Kalau order sebenarnya sudah berhasil
      // tetapi request payment gagal,
      // retry akan menggunakan checkout_id
      // yang sama.
      //
      // Ini mencegah order ganda.
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
        ================================= */}
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
        ================================= */}
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
              gap-4
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
        ================================= */}
        <div
          className="
            p-6
            space-y-5
            max-h-[60vh]
            overflow-y-auto
          "
        >
          {/* DESCRIPTION */}
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
          ================================= */}
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
              {/* NAME */}
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

              {/* EMAIL */}
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

            {/* PHONE */}
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
          ================================= */}
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
              {/* MINUS */}
              <button
                type="button"
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

              {/* QUANTITY NUMBER */}
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

              {/* PLUS */}
              <button
                type="button"
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
          ================================= */}
          <div
            className="
              grid
              grid-cols-2
              gap-3
            "
          >
            {/* ICE */}
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

            {/* SUGAR */}
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
          ================================= */}
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
        ================================= */}
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
          {/* TOTAL */}
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
          ================================= */}
          <button
            type="button"
            onClick={handleCheckoutXendit}
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
