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
  MessageCircle
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


  const isAdminPage =

    window.location.pathname ===
      '/admin' ||

    window.location.pathname ===
      '/admin/';


  /* =========================================================
     PAYMENT RETURN HANDLER
     ========================================================= */

  useEffect(() => {

    /*
     * Payment return handler
     * hanya dijalankan di website utama.
     */

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
      'success'
    ) {

      alert(

        `Pembayaran berhasil!${

          orderNumber

            ? `\nOrder: ${orderNumber}`

            : ''

        }`

      );


      window.history.replaceState(

        {},

        '',

        window.location.pathname

      );

    }


    /* =======================================================
       PAYMENT CANCELLED
       ======================================================= */

    if (
      payment ===
      'cancelled'
    ) {

      alert(

        `Pembayaran dibatalkan.${

          orderNumber

            ? `\nOrder: ${orderNumber}`

            : ''

        }`

      );


      window.history.replaceState(

        {},

        '',

        window.location.pathname

      );

    }

  }, [
    isAdminPage
  ]);


  /* =========================================================
     ADMIN PAGE
     ========================================================= */

  if (
    isAdminPage
  ) {


    /* =======================================================
       ADMIN LOGIN
       ======================================================= */

    if (
      !adminSecret
    ) {

      return (

        <AdminLogin

          onLoginSuccess={(
            secret
          ) =>

            setAdminSecret(
              secret
            )
          }

        />

      );

    }


    /* =======================================================
       ADMIN STOCK
       ======================================================= */

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


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <Navbar />


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main>


        {/* ===================================================
            1. HERO SECTION
        ==================================================== */}

        <HeroSection />


        {/* ===================================================
            2. MENU SECTION
        ==================================================== */}

        <MenuSection

          onSelectMenu={(
            item
          ) =>

            setSelectedItem(
              item
            )
          }

        />


        {/* ===================================================
            3. WHY US SECTION
        ==================================================== */}

        <WhyUsSection />


        {/* ===================================================
            4. PAYMENT SECTION
        ==================================================== */}

        <PaymentSection />


        {/* ===================================================
            5. CONTACT SECTION
        ==================================================== */}

        <ContactSection />


      </main>


      {/* =====================================================
          6. FOOTER
      ====================================================== */}

      <Footer />


      {/* =====================================================
          ORDER MODAL
      ====================================================== */}

      <OrderModal

        item={
          selectedItem
        }

        storeLocation={
          STORE_LOCATION
        }

        onClose={() =>

          setSelectedItem(
            null
          )
        }

      />


      {/* =====================================================
          FLOATING WHATSAPP BUTTON
      ====================================================== */}

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


    </div>

  );

}
