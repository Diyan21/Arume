import React from 'react';
import {
  CreditCard,
  QrCode,
  Landmark,
  Banknote,
  ShieldCheck,
  ScanLine,
  Smartphone,
  WalletCards,
  BadgeHelp,
  MessageCircle,
} from 'lucide-react';

import { PAYMENT_METHODS, CONTACT_INFO } from '../data/coffeeData';

export const PaymentSection: React.FC = () => {
  const getPaymentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'qris':
        return <QrCode className="w-7 h-7 text-[#b8860b]" />;

      case 'transfer bank':
        return <Landmark className="w-7 h-7 text-[#b8860b]" />;

      case 'dana':
        return <Smartphone className="w-7 h-7 text-[#b8860b]" />;

      case 'gopay':
        return <WalletCards className="w-7 h-7 text-[#b8860b]" />;

      case 'ovo':
        return <CreditCard className="w-7 h-7 text-[#b8860b]" />;

      case 'shopeepay':
        return <WalletCards className="w-7 h-7 text-[#b8860b]" />;

      case 'tunai (cash)':
        return <Banknote className="w-7 h-7 text-[#b8860b]" />;

      default:
        return <CreditCard className="w-7 h-7 text-[#b8860b]" />;
    }
  };

  const beanDecor = [
    { top: '10%', left: '3%', rotate: '-24deg', scale: '1' },
    { top: '17%', left: '9%', rotate: '18deg', scale: '0.85' },
    { top: '28%', left: '5%', rotate: '30deg', scale: '0.9' },
    { top: '43%', left: '10%', rotate: '-10deg', scale: '0.78' },
    { top: '62%', left: '4%', rotate: '22deg', scale: '0.88' },
    { top: '78%', left: '11%', rotate: '-30deg', scale: '0.75' },

    { top: '12%', right: '4%', rotate: '20deg', scale: '1' },
    { top: '22%', right: '10%', rotate: '-15deg', scale: '0.82' },
    { top: '34%', right: '5%', rotate: '28deg', scale: '0.92' },
    { top: '48%', right: '12%', rotate: '-22deg', scale: '0.78' },
    { top: '67%', right: '6%', rotate: '16deg', scale: '0.86' },
    { top: '80%', right: '10%', rotate: '-26deg', scale: '0.74' },
  ];

  return (
    <section
      id="payment"
      className="relative overflow-hidden py-20 sm:py-24 bg-gradient-to-b from-[#fbf7f1] via-[#f6efe5] to-[#efe3d1]"
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-[#d4af37]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#c08a3e]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-0 w-72 h-72 bg-[#8b5a2b]/8 rounded-full blur-[120px] pointer-events-none" />

      {/* Coffee Bean Decorations */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {beanDecor.map((bean, index) => (
          <div
            key={`bean-${index}`}
            className="absolute"
            style={{
              top: bean.top,
              left: 'left' in bean ? bean.left : undefined,
              right: 'right' in bean ? bean.right : undefined,
              transform: `rotate(${bean.rotate}) scale(${bean.scale})`,
            }}
          >
            <div className="relative w-10 h-16 rounded-full bg-[#8b5a2b]/8 border border-[#8b5a2b]/8 shadow-sm">
              <div className="absolute left-1/2 top-1 -translate-x-1/2 w-[1px] h-[85%] bg-[#8b5a2b]/16 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Card */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[2rem]
            border
            border-[#d4af37]/20
            bg-[#fffaf3]/88
            backdrop-blur-xl
            px-5
            py-10
            sm:p-12
            shadow-[0_20px_60px_rgba(64,38,17,0.12)]
          "
        >
          {/* Top Gold Line */}
          <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#fff6e8] border border-[#d4af37]/25 mb-5 shadow-sm">
              <ScanLine className="w-4 h-4 text-[#b8860b]" />
              <span className="text-[11px] sm:text-xs font-bold tracking-[0.16em] uppercase text-[#b8860b]">
                Transaksi Praktis & Aman
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#2d1b12] leading-tight mb-4">
              Metode <span className="text-[#b8860b]">Pembayaran</span>
            </h2>

            <div className="w-16 h-[2px] mx-auto mb-5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

            <p className="text-sm sm:text-base text-[#6d5844] font-medium leading-relaxed">
              Pilih metode pembayaran yang paling nyaman untuk transaksi
              ARUME Coffee.
            </p>
          </div>

          {/* Payment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
            {PAYMENT_METHODS.map((method, index) => (
              <div
                key={method.id}
                className="
                  relative
                  group
                  min-h-[175px]
                  sm:min-h-[190px]
                  rounded-2xl
                  border
                  border-[#d9c4a3]
                  bg-[#fffdf9]
                  px-4
                  py-6
                  flex
                  flex-col
                  items-center
                  justify-center
                  text-center
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#d4af37]/70
                  hover:bg-[#fff8ef]
                  hover:shadow-[0_15px_35px_rgba(180,134,11,0.12)]
                "
              >
                {/* Card Number */}
                <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-[#b8860b]/35">
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Icon */}
                <div
                  className="
                    w-14
                    h-14
                    sm:w-16
                    sm:h-16
                    rounded-2xl
                    bg-[#fff6e8]
                    border
                    border-[#d4af37]/25
                    flex
                    items-center
                    justify-center
                    mb-4
                    transition-all
                    duration-300
                    group-hover:bg-[#fff0d2]
                    group-hover:border-[#d4af37]/70
                    group-hover:scale-105
                    group-hover:shadow-[0_0_25px_rgba(212,175,55,0.10)]
                  "
                >
                  {getPaymentIcon(method.name)}
                </div>

                {/* Name */}
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-[#2d1b12] transition-colors duration-300 group-hover:text-[#b8860b]">
                  {method.name}
                </h3>

                {/* Type */}
                <span className="mt-2 text-[11px] sm:text-xs font-medium text-[#7b6753]">
                  {method.type}
                </span>
              </div>
            ))}

            {/* Extra Fill Card */}
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="
                relative
                group
                min-h-[175px]
                sm:min-h-[190px]
                rounded-2xl
                border
                border-[#d4af37]/35
                bg-gradient-to-br
                from-[#fff8ef]
                to-[#f7ebda]
                px-4
                py-6
                flex
                flex-col
                items-center
                justify-center
                text-center
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#b8860b]/70
                hover:shadow-[0_15px_35px_rgba(180,134,11,0.14)]
              "
            >
              <span className="absolute top-3 right-3 text-[10px] font-bold tracking-wider text-[#b8860b]/35">
                08
              </span>

              <div
                className="
                  w-14
                  h-14
                  sm:w-16
                  sm:h-16
                  rounded-2xl
                  bg-[#fff3df]
                  border
                  border-[#d4af37]/30
                  flex
                  items-center
                  justify-center
                  mb-4
                  transition-all
                  duration-300
                  group-hover:bg-[#ffeaca]
                  group-hover:border-[#d4af37]/70
                "
              >
                <MessageCircle className="w-7 h-7 text-[#b8860b]" />
              </div>

              <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-[#2d1b12] group-hover:text-[#b8860b] transition-colors">
                Bantuan Pembayaran
              </h3>

              <span className="mt-2 text-[11px] sm:text-xs font-medium text-[#7b6753] leading-relaxed">
                Konfirmasi cepat via WhatsApp jika butuh bantuan transaksi
              </span>
            </a>
          </div>

          {/* Security Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-7 border-t border-[#d9c4a3] text-center">
            <ShieldCheck className="w-5 h-5 text-[#b8860b] shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-[#6d5844]">
              Pembayaran diproses dengan aman dan transparan tanpa biaya
              tersembunyi.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
