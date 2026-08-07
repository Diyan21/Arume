import React from 'react';
import { Coffee, MessageCircle, ArrowRight, Star, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { CONTACT_INFO } from '../data/coffeeData';

export const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Background Image with Dark Glossy Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80"
          alt="ARUME Coffee Ambiance"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-[1.15] scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Glossy Dark Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0806]/90 via-[#0d0906]/75 to-[#0a0806]" />
        <div className="absolute inset-0 bg-radial-at-c from-[#d4af37]/10 via-transparent to-transparent pointer-events-none animate-pulse-glow" />
      </div>

      {/* Decorative Gold & Coffee Ambient Lighting Circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#d4af37]/15 to-[#8b5a2b]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#c99700]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#3a2012]/30 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-[#d4af37]/30 mb-8 animate-in fade-in duration-700">
          <Sparkles className="w-4 h-4 text-[#e5b869] animate-spin-slow" />
          <span className="text-xs sm:text-sm font-medium tracking-wide text-[#f0e6d2]">
            Authentic Indonesian Premium Coffee Blend
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
        </div>

        {/* Big Brand Title */}
        <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
          <span className="gold-gradient-text drop-shadow-[0_10px_20px_rgba(212,175,55,0.2)]">
            ARUME
          </span>
          <span className="block text-2xl sm:text-4xl lg:text-5xl font-sans font-light tracking-[0.2em] text-[#d4af37]/90 mt-2 uppercase">
            Coffee Shop
          </span>
        </h1>

        {/* Tagline */}
        <p className="max-w-2xl text-lg sm:text-2xl text-[#e8ded1] font-light leading-relaxed mb-10 text-shadow">
          "Nikmati Kopi Berkualitas dengan Rasa Premium Setiap Hari."
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
          {/* Lihat Menu Button */}
          <a
            href="#menu"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel border border-[#d4af37]/40 hover:border-[#d4af37] text-white font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300 hover:bg-[#d4af37]/15 hover:shadow-[0_0_25px_rgba(212,175,55,0.25)] group"
          >
            <Coffee className="w-5 h-5 text-[#e5b869] group-hover:rotate-12 transition-transform" />
            <span>Lihat Menu</span>
            <ArrowRight className="w-4 h-4 text-[#e5b869] group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Pesan Sekarang Button */}
          <a
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto gold-gradient-btn px-8 py-4 rounded-full text-base font-bold flex items-center justify-center gap-3 group shadow-xl"
          >
            <MessageCircle className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
            <span>Pesan Sekarang</span>
          </a>
        </div>

        {/* Quick Features Highlight Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl pt-6 border-t border-[#d4af37]/15">
          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl glass-panel text-left">
            <Star className="w-5 h-5 text-[#d4af37] fill-[#d4af37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">4.9 / 5.0 Rating</p>
              <p className="text-[11px] text-[#b8a99a]">1,200+ Penikmat Kopi</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl glass-panel text-left">
            <Flame className="w-5 h-5 text-[#e5b869] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">100% Arabica</p>
              <p className="text-[11px] text-[#b8a99a]">Biji Kopi Pilihan</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl glass-panel text-left">
            <Coffee className="w-5 h-5 text-[#d4af37] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Freshly Brewed</p>
              <p className="text-[11px] text-[#b8a99a]">Dibuat Setiap Hari</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 p-3 rounded-xl glass-panel text-left">
            <ShieldCheck className="w-5 h-5 text-[#e5b869] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Rasa Terjamin</p>
              <p className="text-[11px] text-[#b8a99a]">Standar Barista</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
