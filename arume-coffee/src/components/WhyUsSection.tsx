import React from 'react';
import {
  Coffee,
  Flame,
  Sparkles,
  Award,
  ShieldCheck,
} from 'lucide-react';

import { WHY_US_ITEMS } from '../data/coffeeData';

export const WhyUsSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bean':
        return <Flame className="w-8 h-8 text-[#b8860b]" />;

      case 'Coffee':
        return <Coffee className="w-8 h-8 text-[#b8860b]" />;

      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-[#b8860b]" />;

      case 'Award':
        return <Award className="w-8 h-8 text-[#b8860b]" />;

      default:
        return <Coffee className="w-8 h-8 text-[#b8860b]" />;
    }
  };

  const coffeeBeans = [
    { top: '12%', left: '3%', rotate: '-25deg', scale: 0.85 },
    { top: '26%', left: '8%', rotate: '20deg', scale: 0.65 },
    { top: '48%', left: '4%', rotate: '35deg', scale: 0.75 },
    { top: '73%', left: '9%', rotate: '-18deg', scale: 0.65 },

    { top: '10%', right: '4%', rotate: '20deg', scale: 0.8 },
    { top: '30%', right: '9%', rotate: '-18deg', scale: 0.65 },
    { top: '55%', right: '4%', rotate: '28deg', scale: 0.75 },
    { top: '78%', right: '9%', rotate: '-28deg', scale: 0.65 },
  ];

  return (
    <section
      id="why-us"
      className="
        py-20
        sm:py-24
        relative
        overflow-hidden
        bg-gradient-to-b
        from-[#fbf7f1]
        via-[#f6efe5]
        to-[#f2e8da]
      "
    >
      {/* BACKGROUND GOLD GLOW */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-[750px]
          h-[350px]
          bg-[#d4af37]/10
          rounded-full
          blur-[160px]
          pointer-events-none
        "
      />

      {/* COFFEE BEANS SAMAR */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {coffeeBeans.map((bean, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              top: bean.top,
              left: 'left' in bean ? bean.left : undefined,
              right: 'right' in bean ? bean.right : undefined,
              transform: `rotate(${bean.rotate}) scale(${bean.scale})`,
            }}
          >
            <div
              className="
                relative
                w-10
                h-15
                rounded-[50%]
                bg-[#70452d]/[0.06]
                border
                border-[#70452d]/[0.08]
              "
            >
              <div
                className="
                  absolute
                  left-1/2
                  top-[8%]
                  -translate-x-1/2
                  w-[1px]
                  h-[84%]
                  bg-[#70452d]/15
                  rotate-12
                  rounded-full
                "
              />
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* HEADER */}
        <div className="text-center max-w-4xl mx-auto mb-14">

          {/* Badge */}
          <div
            className="
              inline-flex
              items-center
              gap-2
              px-4
              py-2
              rounded-full
              bg-white/55
              backdrop-blur-md
              border
              border-[#d4af37]/30
              mb-5
              shadow-sm
            "
          >
            <ShieldCheck className="w-4 h-4 text-[#b8860b]" />

            <span
              className="
                text-[11px]
                sm:text-xs
                font-extrabold
                text-[#b8860b]
                tracking-[0.16em]
                uppercase
              "
            >
              Komitmen Kualitas ARUME
            </span>
          </div>

          {/* TITLE */}
          <h2
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              tracking-tight
              text-[#2d1b12]
              leading-tight
              mb-4
            "
          >
            Mengapa Memilih{' '}
            <span className="text-[#b8860b]">
              ARUME?
            </span>
          </h2>

          {/* Gold Divider */}
          <div
            className="
              w-20
              h-[2px]
              mx-auto
              mb-5
              bg-gradient-to-r
              from-transparent
              via-[#d4af37]
              to-transparent
            "
          />

          {/* SUBTITLE */}
          <p
            className="
              text-[#6d5844]
              text-sm
              sm:text-base
              lg:text-lg
              font-medium
              leading-relaxed
              max-w-3xl
              mx-auto
            "
          >
            Nikmati coffee enak hanya di{' '}
            <span className="font-extrabold text-[#2d1b12]">
              ARUME Coffee
            </span>
            , rasakan sensasi{' '}
            <span className="font-extrabold text-[#b8860b]">
              Arumeya
            </span>{' '}
            <span className="italic">
              (Keharuman & Kehangatannya).
            </span>
          </p>

        </div>

        {/* 4 FEATURE CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {WHY_US_ITEMS.map((item) => (
            <div
              key={item.id}
              className="
                bg-[#fffdf9]
                border
                border-[#d9c4a3]
                p-8
                rounded-3xl
                flex
                flex-col
                items-center
                text-center
                group
                relative
                overflow-hidden
                shadow-[0_12px_35px_rgba(92,58,28,0.07)]
                transition-all
                duration-300
                hover:-translate-y-1.5
                hover:border-[#d4af37]/70
                hover:bg-[#fff8ef]
                hover:shadow-[0_18px_40px_rgba(184,134,11,0.13)]
              "
            >

              {/* ICON */}
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-[#fff3df]
                  border
                  border-[#d4af37]/30
                  flex
                  items-center
                  justify-center
                  mb-6
                  transition-all
                  duration-300
                  group-hover:scale-110
                  group-hover:bg-[#ffedcc]
                  group-hover:border-[#d4af37]/70
                  group-hover:shadow-[0_8px_25px_rgba(184,134,11,0.14)]
                "
              >
                {getIcon(item.icon)}
              </div>

              {/* TITLE */}
              <h3
                className="
                  text-lg
                  sm:text-xl
                  font-black
                  tracking-tight
                  text-[#2d1b12]
                  mb-3
                  transition-colors
                  group-hover:text-[#b8860b]
                "
              >
                {item.title}
              </h3>

              {/* DESCRIPTION */}
              <p
                className="
                  text-sm
                  text-[#705d49]
                  font-medium
                  leading-relaxed
                "
              >
                {item.description}
              </p>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};
