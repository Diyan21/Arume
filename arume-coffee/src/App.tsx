import React, {
  useEffect,
  useState
} from 'react';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { WhyUsSection } from './components/WhyUsSection';
import { PaymentSection } from './components/PaymentSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { OrderStatus } from './components/OrderStatus';

import {
  AdminLogin
} from './admin/AdminLogin';

import {
  AdminStock
} from './admin/AdminStock';

import {
  CoffeeMenuItem
} from './types';

import {
  CONTACT_INFO
} from './data/coffeeData';

import {
  Coffee,
  MessageCircle,
  ReceiptText
} from 'lucide-react';


/* =========================================================
   STORE LOCATION
   ========================================================= */

const STORE_LOCATION = {

  name:
    'Arume Coffee',

  address:
    'Madrasah Ibtidaiyah Negeri 7, Cengkareng Timur, Jakarta Barat 11730',

  latitude:
    -6.145680,

  longitude:
    106.736081,

  postalCode:
    '11730',

};


/* =========================================================
   LOCAL STORAGE KEY
   ========================================================= */

const ACTIVE_ORDER_STORAGE_KEY =
  'arume_active_order';


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  const [
    selectedItem,
    setSelectedItem
  ] =
    useState<CoffeeMenuItem | null>(
      null
    );


  const [
    adminSecret,
    setAdminSecret
  ] =
    useState<string | null>(
      () =>
        sessionStorage.getItem(
          'arume_admin_secret'
        )
    );


  /* =========================================================
     ACTIVE ORDER
     ========================================================= */

  const [
    activeOrderNumber,
    setActiveOrderNumber
  ] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          ACTIVE_ORDER_STORAGE_KEY
        )
    );


  /* =========================================================
     SHOW FULL ORDER STATUS
     ========================================================= */

  const [
    showOrderStatus,
    setShowOrderStatus
  ] =
    useState(
      false
    );


  /* =========================================================
     PAYMENT CANCELLED
     ========================================================= */

  const [
    paymentCancelledOrder,
    setPaymentCancelledOrder
  ] =
    useState<string | null>(
      null
    );


  /* =========================================================
     ADMIN PAGE CHECK
     ========================================================= */

  const isAdminPage =

    window.location.pathname ===
      '/admin' ||

    window.location.pathname ===
      '/admin/';


  /* =========================================================
     SAVE ACTIVE ORDER
     ========================================================= */

  const saveActiveOrder =
    (
      orderNumber:
        string
    ) => {

      const normalized =
        String(
          orderNumber ||
          ''
        )
          .trim();


      if (
        !normalized
      ) {

        return;
      }


      localStorage.setItem(
        ACTIVE_ORDER_STORAGE_KEY,
        normalized
      );


      setActiveOrderNumber(
        normalized
      );
    };


  /* =========================================================
     REMOVE ACTIVE ORDER
     ========================================================= */

  const removeActiveOrder =
    () => {

      localStorage.removeItem(
        ACTIVE_ORDER_STORAGE_KEY
      );


      setActiveOrderNumber(
        null
      );


      setShowOrderStatus(
        false
      );
    };


  /* =========================================================
     PAYMENT RETURN HANDLER
     ========================================================= */

  useEffect(
    () => {

      if (
        isAdminPage
      ) {

        return;
      }


      const params =
        new URLSearchParams(
          window.location.search
        );


      const payment =
        params.get(
          'payment'
        );


      const orderNumber =
        params.get(
          'order'
        );


      /* =======================================================
         PAYMENT SUCCESS
         ======================================================= */

      if (
        payment ===
          'success' &&
        orderNumber
      ) {

        saveActiveOrder(
          orderNumber
        );


        setShowOrderStatus(
          true
        );


        setPaymentCancelledOrder(
          null
        );


        window.history.replaceState(
          {},
          '',
          window.location.pathname
        );


        return;
      }


      /* =======================================================
         PAYMENT CANCELLED
         ======================================================= */

      if (
        payment ===
        'cancelled'
      ) {

        setPaymentCancelledOrder(
          orderNumber ||
          'Pesanan'
        );


        window.history.replaceState(
          {},
          '',
          window.location.pathname
        );
      }

    },
    [
      isAdminPage
    ]
  );


  /* =========================================================
     ADMIN PAGE
     ========================================================= */

  if (
    isAdminPage
  ) {

    if (
      !adminSecret
    ) {

      return (

        <AdminLogin

          onLoginSuccess={(
            secret
          ) => {

            setAdminSecret(
              secret
            );

          }}

        />

      );
    }


    return (

      <AdminStock

        secret={
          adminSecret
        }

        onLogout={() => {

          sessionStorage.removeItem(
            'arume_admin_secret'
          );


          setAdminSecret(
            null
          );

        }}

      />

    );
  }


  /* =========================================================
     MAIN WEBSITE
     ========================================================= */

  return (

    <div
      className="
        min-h-screen
        bg-[#0a0806]
        text-[#f3ece2]
        font-sans
        selection:bg-[#d4af37]
        selection:text-black
        relative
      "
    >


      <Navbar />


      <main>

        <HeroSection />


        <MenuSection

          onSelectMenu={(
            item
          ) => {

            setSelectedItem(
              item
            );

          }}

        />


        <WhyUsSection />


        <PaymentSection />


        <ContactSection />

      </main>


      <Footer />


      {/* =====================================================
          ORDER MODAL
          ===================================================== */}

      <OrderModal

        item={
          selectedItem
        }

        storeLocation={
          STORE_LOCATION
        }

        onClose={() => {

          setSelectedItem(
            null
          );

        }}

      />


      {/* =====================================================
          FULL ORDER STATUS
          ===================================================== */}

      {activeOrderNumber &&
      showOrderStatus && (

        <OrderStatus

          orderNumber={
            activeOrderNumber
          }

          onClose={(
            finalStatus
          ) => {

            const normalizedStatus =
              String(
                finalStatus ||
                ''
              )
                .trim()
                .toLowerCase();


            /*
             * Kalau status sudah selesai,
             * gagal, atau refund,
             * hapus order aktif.
             */

            if (
              normalizedStatus ===
                'completed' ||

              normalizedStatus ===
                'failed' ||

              normalizedStatus ===
                'refunded'
            ) {

              removeActiveOrder();

              return;
            }


            /*
             * pending / paid / ready:
             *
             * Hanya tutup halaman besar.
             * Mini popup tetap muncul.
             */

            setShowOrderStatus(
              false
            );


            window.scrollTo({
              top:
                0,

              behavior:
                'smooth'
            });

          }}

        />

      )}


      {/* =====================================================
          MINI ACTIVE ORDER POPUP
          ===================================================== */}

      {activeOrderNumber &&
      !showOrderStatus &&
      !paymentCancelledOrder && (

        <div
          className="
            fixed
            bottom-5
            left-4
            right-4
            z-50
            sm:left-auto
            sm:right-6
            sm:w-[390px]
          "
        >

          <div
            className="
              rounded-2xl
              border
              border-[#d4af37]/30
              bg-[#17100b]
              shadow-2xl
              shadow-black/70
              overflow-hidden
            "
          >

            <button
              type="button"

              onClick={() => {

                setShowOrderStatus(
                  true
                );

              }}

              className="
                w-full
                p-4
                flex
                items-center
                gap-4
                text-left
                hover:bg-[#1d150f]
                active:bg-[#211810]
                transition
              "
            >

              <div
                className="
                  w-12
                  h-12
                  shrink-0
                  rounded-xl
                  bg-[#d4af37]/10
                  border
                  border-[#d4af37]/30
                  flex
                  items-center
                  justify-center
                "
              >

                <Coffee
                  className="
                    w-6
                    h-6
                    text-[#d4af37]
                  "
                />

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.15em]
                    text-[#9f8d7a]
                  "
                >
                  Pesanan Aktif
                </p>


                <p
                  className="
                    text-base
                    font-bold
                    text-[#f3ece2]
                    mt-1
                  "
                >
                  Lihat Status Pesanan
                </p>


                <p
                  className="
                    text-xs
                    font-mono
                    text-[#d4af37]
                    mt-1
                    truncate
                  "
                >
                  {activeOrderNumber}
                </p>

              </div>


              <ReceiptText
                className="
                  w-5
                  h-5
                  shrink-0
                  text-[#d4af37]
                "
              />

            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          PAYMENT CANCELLED
          ===================================================== */}

      {paymentCancelledOrder && (

        <div
          className="
            fixed
            inset-0
            z-[100]
            bg-black/80
            backdrop-blur-sm
            flex
            items-center
            justify-center
            px-4
          "
        >

          <div
            className="
              w-full
              max-w-md
              rounded-2xl
              bg-[#13100d]
              border
              border-red-500/30
              p-6
              text-center
              shadow-2xl
            "
          >

            <div
              className="
                w-14
                h-14
                rounded-full
                bg-red-950/40
                border
                border-red-500/30
                flex
                items-center
                justify-center
                mx-auto
                text-red-300
                text-2xl
                font-bold
              "
            >
              !
            </div>


            <h2
              className="
                text-2xl
                font-bold
                mt-4
              "
            >
              Pembayaran Dibatalkan
            </h2>


            <p
              className="
                text-[#ad9f91]
                mt-2
              "
            >
              Pembayaran untuk
            </p>


            <p
              className="
                font-mono
                text-[#d4af37]
                font-bold
                mt-1
                break-all
              "
            >
              {paymentCancelledOrder}
            </p>


            <button
              type="button"

              onClick={() => {

                setPaymentCancelledOrder(
                  null
                );

              }}

              className="
                mt-6
                w-full
                py-3
                rounded-xl
                bg-[#d4af37]
                hover:bg-[#e2c256]
                text-black
                font-bold
                transition
              "
            >
              Kembali ke Arume
            </button>

          </div>

        </div>

      )}


      {/* =====================================================
          FLOATING WHATSAPP BUTTON
          ===================================================== */}

      {!activeOrderNumber &&
      !paymentCancelledOrder && (

        <a

          href={
            CONTACT_INFO.whatsappUrl
          }

          target="_blank"

          rel="
            noopener noreferrer
          "

          className="
            fixed
            bottom-6
            right-6
            z-40
            p-4
            rounded-full
            bg-gradient-to-r
            from-[#22c55e]
            to-[#16a34a]
            hover:from-[#25d366]
            hover:to-[#15803d]
            text-white
            shadow-2xl
            shadow-emerald-950/60
            flex
            items-center
            gap-2.5
            hover:scale-110
            active:scale-95
            transition-all
            duration-300
            border
            border-emerald-400/30
            group
          "

          aria-label="
            Pesan via WhatsApp
          "

        >

          <MessageCircle
            className="
              w-6
              h-6
              text-white
              group-hover:rotate-12
              transition-transform
            "
          />


          <span
            className="
              hidden
              sm:inline
              font-bold
              text-sm
              pr-1
            "
          >
            Pesan Fast-Response
          </span>

        </a>

      )}


    </div>

  );
}
