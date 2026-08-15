import React from 'react';
import {
  Coffee,
  MessageCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

import { CONTACT_INFO } from '../data/coffeeData';

export const HeroSection: React.FC = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* VIDEO BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/arume-hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

        {/* Badge */}
        <div
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-black/25
            backdrop-blur-md
            border
            border-[#d4af37]/30
            mb-8
          "
        >
          <Sparkles className="w-4 h-4 text-[#e5b869]" />

          <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f0e6d2]">
            Authentic Indonesian Premium Coffee Blend
          </span>

          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-row items-center justify-center gap-3">

          {/* LIHAT MENU */}
          <a
            href="#menu"
            className="
              px-5
              py-2.5
              rounded-full
              bg-black/20
              backdrop-blur-md
              border
              border-[#d4af37]/50
              text-white
              text-sm
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-300
              hover:bg-black/45
              hover:border-[#d4af37]
              hover:scale-[1.03]
              group
            "
          >
            <Coffee className="w-4 h-4 text-[#e5b869]" />

            <span>Lihat Menu</span>

            <ArrowRight className="w-3.5 h-3.5 text-[#e5b869] group-hover:translate-x-1 transition-transform" />
          </a>

          {/* PESAN SEKARANG */}
          <a
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              px-5
              py-2.5
              rounded-full
              bg-[#d4af37]/15
              backdrop-blur-md
              border
              border-[#d4af37]/60
              text-[#f3cf63]
              text-sm
              font-semibold
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-300
              hover:bg-[#d4af37]/30
              hover:border-[#e5b869]
              hover:text-white
              hover:scale-[1.03]
              group
            "
          >
            <MessageCircle className="w-4 h-4" />

            <span>Pesan Sekarang</span>
          </a>

        </div>

      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10">
        <div className="w-[1px] h-10 bg-gradient-to-b from-[#d4af37] to-transparent" />
      </div>

    </section>
  );
};
