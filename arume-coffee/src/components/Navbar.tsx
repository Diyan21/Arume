import React, {
  useEffect,
  useState
} from 'react';

import {
  Coffee,
  MessageCircle,
  Menu as MenuIcon,
  X,
  UserRound,
  LogOut
} from 'lucide-react';

import {
  CONTACT_INFO
} from '../data/coffeeData';


interface NavbarProps {

  customerName?: string | null;

  onOpenAuth?: () => void;

  onLogout?: () => void;

  onOpenQuickOrder?: () => void;
}


export const Navbar:
React.FC<NavbarProps> = ({

  customerName,

  onOpenAuth,

  onLogout

}) => {


  const [
    scrolled,
    setScrolled
  ] =
    useState(
      false
    );


  const [
    mobileMenuOpen,
    setMobileMenuOpen
  ] =
    useState(
      false
    );


  useEffect(
    () => {

      const handleScroll =
        () => {

          setScrolled(
            window.scrollY >
            30
          );
        };


      window.addEventListener(
        'scroll',
        handleScroll
      );


      return () => {

        window.removeEventListener(
          'scroll',
          handleScroll
        );
      };

    },
    []
  );


  const navLinks = [

    {
      name:
        'Beranda',
      href:
        '#hero'
    },

    {
      name:
        'Menu Kopi',
      href:
        '#menu'
    },

    {
      name:
        'Keunggulan',
      href:
        '#why-us'
    },

    {
      name:
        'Pembayaran',
      href:
        '#payment'
    },

    {
      name:
        'Kontak',
      href:
        '#contact'
    }

  ];


  return (

    <header

      className={`
        fixed
        top-0
        left-0
        right-0
        z-50
        transition-all
        duration-500

        ${
          scrolled

            ? `
                bg-[#0f0c09]/85
                backdrop-blur-md
                border-b
                border-[#d4af37]/20
                py-3
                shadow-2xl
                shadow-black/80
              `

            : `
                bg-transparent
                py-5
              `
        }
      `}

    >


      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >


        <div
          className="
            flex
            items-center
            justify-between
          "
        >


          {/* =====================================================
              LOGO
              ===================================================== */}

          <a
            href="#hero"

            className="
              flex
              items-center
              gap-2.5
              group
            "
          >

            <div
              className="
                w-10
                h-10
                rounded-full
                bg-gradient-to-br
                from-[#d4af37]
                via-[#9a6f00]
                to-[#3a2818]
                p-0.5
                shadow-lg
                shadow-[#d4af37]/20
                group-hover:scale-105
                transition-transform
                duration-300
              "
            >

              <div
                className="
                  w-full
                  h-full
                  bg-[#0d0a07]
                  rounded-full
                  flex
                  items-center
                  justify-center
                "
              >

                <Coffee
                  className="
                    w-5
                    h-5
                    text-[#e5b869]
                    group-hover:rotate-12
                    transition-transform
                    duration-300
                  "
                />

              </div>

            </div>


            <div
              className="
                flex
                flex-col
              "
            >

              <span
                className="
                  font-display
                  font-bold
                  text-2xl
                  tracking-wider
                  gold-gradient-text
                "
              >
                ARUME
              </span>


              <span
                className="
                  text-[10px]
                  tracking-[0.25em]
                  text-[#c99700]/80
                  uppercase
                  -mt-1
                  font-sans
                "
              >
                Coffee
              </span>

            </div>

          </a>



          {/* =====================================================
              DESKTOP NAV
              ===================================================== */}

          <nav
            className="
              hidden
              md:flex
              items-center
              gap-8
              glass-panel
              px-6
              py-2
              rounded-full
              border
              border-[#d4af37]/15
            "
          >

            {
              navLinks.map(
                link => (

                  <a

                    key={
                      link.name
                    }

                    href={
                      link.href
                    }

                    className="
                      text-sm
                      font-medium
                      text-[#e0d6c8]
                      hover:text-[#f0c84c]
                      transition-colors
                      relative
                      py-1

                      after:content-['']
                      after:absolute
                      after:bottom-0
                      after:left-0
                      after:w-0
                      after:h-[2px]
                      after:bg-[#d4af37]

                      hover:after:w-full

                      after:transition-all
                      after:duration-300
                    "
                  >

                    {link.name}

                  </a>

                )
              )
            }

          </nav>



          {/* =====================================================
              DESKTOP ACTIONS
              ===================================================== */}

          <div
            className="
              hidden
              md:flex
              items-center
              gap-2
            "
          >


            {/* CUSTOMER LOGIN */}

            {
              customerName

                ? (

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >


                    <div
                      className="
                        px-4
                        py-2.5
                        rounded-full
                        border
                        border-[#d4af37]/30
                        bg-[#18120d]/90
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <UserRound
                        className="
                          w-4
                          h-4
                          text-[#d4af37]
                        "
                      />


                      <span
                        className="
                          text-sm
                          font-semibold
                          text-[#f3ece2]
                          max-w-[130px]
                          truncate
                        "
                      >
                        {customerName}
                      </span>

                    </div>


                    <button

                      type="button"

                      onClick={
                        onLogout
                      }

                      title="Keluar"

                      className="
                        w-10
                        h-10
                        rounded-full
                        border
                        border-[#d4af37]/30
                        bg-[#18120d]
                        text-[#d4af37]
                        flex
                        items-center
                        justify-center
                        hover:bg-[#d4af37]
                        hover:text-black
                        transition
                      "
                    >

                      <LogOut
                        className="
                          w-4
                          h-4
                        "
                      />

                    </button>

                  </div>

                )

                : (

                  <button

                    type="button"

                    onClick={
                      onOpenAuth
                    }

                    className="
                      px-4
                      py-2.5
                      rounded-full
                      border
                      border-[#d4af37]/40
                      bg-[#18120d]/80
                      text-[#d4af37]
                      text-sm
                      font-semibold
                      flex
                      items-center
                      gap-2
                      hover:bg-[#d4af37]
                      hover:text-black
                      transition
                    "
                  >

                    <UserRound
                      className="
                        w-4
                        h-4
                      "
                    />

                    Masuk

                  </button>

                )
            }



            {/* WHATSAPP */}

            <a

              href={
                CONTACT_INFO.whatsappUrl
              }

              target="_blank"

              rel="
                noopener noreferrer
              "

              className="
                gold-gradient-btn
                px-5
                py-2.5
                rounded-full
                text-sm
                font-semibold
                flex
                items-center
                gap-2
                group
              "
            >

              <MessageCircle
                className="
                  w-4
                  h-4
                  text-black
                  group-hover:scale-110
                  transition-transform
                "
              />

              <span>
                Pesan Sekarang
              </span>

            </a>

          </div>



          {/* =====================================================
              MOBILE BUTTON
              ===================================================== */}

          <button

            type="button"

            onClick={
              () =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
            }

            className="
              md:hidden
              p-2
              rounded-lg
              bg-[#1d1611]/80
              border
              border-[#d4af37]/30
              text-[#e0d6c8]
              hover:text-[#d4af37]
            "

            aria-label="
              Toggle menu
            "
          >

            {
              mobileMenuOpen

                ? (

                  <X
                    className="
                      w-6
                      h-6
                    "
                  />

                )

                : (

                  <MenuIcon
                    className="
                      w-6
                      h-6
                    "
                  />

                )
            }

          </button>

        </div>



        {/* =====================================================
            MOBILE MENU
            ===================================================== */}

        {
          mobileMenuOpen && (

            <div
              className="
                md:hidden
                mt-3
                p-5
                rounded-2xl
                glass-panel
                border
                border-[#d4af37]/30
                animate-in
                fade-in
                slide-in-from-top-4
                duration-300
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-4
                "
              >


                {
                  navLinks.map(
                    link => (

                      <a

                        key={
                          link.name
                        }

                        href={
                          link.href
                        }

                        onClick={
                          () =>
                            setMobileMenuOpen(
                              false
                            )
                        }

                        className="
                          text-base
                          font-medium
                          text-[#e0d6c8]
                          hover:text-[#f0c84c]
                          transition-colors
                          py-1.5
                          border-b
                          border-[#2a2018]
                        "
                      >

                        {link.name}

                      </a>

                    )
                  )
                }



                {/* CUSTOMER MOBILE */}

                {
                  customerName

                    ? (

                      <div
                        className="
                          rounded-xl
                          border
                          border-[#d4af37]/30
                          bg-[#18120d]
                          p-3
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <UserRound
                            className="
                              w-4
                              h-4
                              text-[#d4af37]
                            "
                          />

                          <span
                            className="
                              text-sm
                              font-semibold
                              text-white
                              flex-1
                              truncate
                            "
                          >
                            {customerName}
                          </span>

                        </div>


                        <button

                          type="button"

                          onClick={
                            () => {

                              setMobileMenuOpen(
                                false
                              );

                              onLogout?.();
                            }
                          }

                          className="
                            w-full
                            mt-3
                            py-2.5
                            rounded-lg
                            border
                            border-[#d4af37]/30
                            text-[#d4af37]
                            text-sm
                            font-semibold
                            flex
                            items-center
                            justify-center
                            gap-2
                          "
                        >

                          <LogOut
                            className="
                              w-4
                              h-4
                            "
                          />

                          Keluar

                        </button>

                      </div>

                    )

                    : (

                      <button

                        type="button"

                        onClick={
                          () => {

                            setMobileMenuOpen(
                              false
                            );

                            onOpenAuth?.();
                          }
                        }

                        className="
                          w-full
                          py-3
                          rounded-xl
                          border
                          border-[#d4af37]/40
                          bg-[#18120d]
                          text-[#d4af37]
                          text-sm
                          font-semibold
                          flex
                          items-center
                          justify-center
                          gap-2
                        "
                      >

                        <UserRound
                          className="
                            w-4
                            h-4
                          "
                        />

                        Masuk / Daftar

                      </button>

                    )
                }



                {/* WHATSAPP MOBILE */}

                <a

                  href={
                    CONTACT_INFO.whatsappUrl
                  }

                  target="_blank"

                  rel="
                    noopener noreferrer
                  "

                  onClick={
                    () =>
                      setMobileMenuOpen(
                        false
                      )
                  }

                  className="
                    gold-gradient-btn
                    w-full
                    py-3
                    rounded-xl
                    text-center
                    text-sm
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                  "
                >

                  <MessageCircle
                    className="
                      w-4
                      h-4
                      text-black
                    "
                  />

                  <span>
                    Pesan Via WhatsApp
                  </span>

                </a>

              </div>

            </div>

          )
        }

      </div>

    </header>
  );
};
