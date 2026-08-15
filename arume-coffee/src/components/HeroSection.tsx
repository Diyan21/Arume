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

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/45" />

        {/* Gradient supaya tulisan tetap jelas */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />

        {/* Gold Ambient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/30 backdrop-blur-md border border-[#d4af37]/30 mb-8">
          <Sparkles className="w-4 h-4 text-[#e5b869]" />

          <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f0e6d2]">
            Authentic Indonesian Premium Coffee Blend
          </span>

          <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
        </div>

        {/* BRAND */}
        <h1 className="font-display font-black leading-none mb-7">

          <span className="block text-6xl sm:text-7xl lg:text-9xl gold-gradient-text drop-shadow-2xl">
            ARUME
          </span>

          <span className="block text-xl sm:text-3xl lg:text-4xl font-sans font-light tracking-[0.35em] text-[#d4af37] mt-5 uppercase">
            Coffee Shop
          </span>

        </h1>

        {/* TAGLINE */}
        <p className="max-w-2xl text-lg sm:text-xl lg:text-2xl text-white/90 font-light leading-relaxed mb-10 drop-shadow-lg">
          Nikmati Kopi Berkualitas dengan Rasa Premium Setiap Hari.
        </p>

        {/* BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          <a
            href="#menu"
            className="
              w-full sm:w-auto
              px-8 py-4
              rounded-full
              bg-black/30
              backdrop-blur-md
              border border-[#d4af37]/40
              hover:border-[#d4af37]
              text-white
              font-semibold
              flex items-center justify-center gap-3
              transition-all duration-300
              hover:bg-black/50
              group
            "
          >
            <Coffee className="w-5 h-5 text-[#e5b869]" />

            <span>Lihat Menu</span>

            <ArrowRight className="w-4 h-4 text-[#e5b869] group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              w-full sm:w-auto
              gold-gradient-btn
              px-9 py-4
              rounded-full
              text-base
              font-bold
              flex items-center justify-center gap-3
              shadow-xl
              group
            "
          >
            <MessageCircle className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />

            <span>Pesan Sekarang</span>
          </a>

        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10">
        <div className="w-[1px] h-12 bg-gradient-to-b from-[#d4af37] to-transparent" />
      </div>

    </section>
  );
};
