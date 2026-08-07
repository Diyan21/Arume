import React from 'react';
import { Coffee, Heart, Instagram, MessageCircle, MapPin, Clock } from 'lucide-react';
import { CONTACT_INFO } from '../data/coffeeData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#070504] text-[#a89b8c] border-t border-[#d4af37]/20 pt-16 pb-8 relative overflow-hidden">
      {/* Glossy ambient bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-48 bg-[#d4af37]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#221a14]">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <a href="#hero" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] via-[#9a6f00] to-[#3a2818] p-0.5">
                <div className="w-full h-full bg-[#0d0a07] rounded-full flex items-center justify-center">
                  <Coffee className="w-5 h-5 text-[#e5b869]" />
                </div>
              </div>
              <span className="font-display font-bold text-2xl tracking-wider gold-gradient-text">
                ARUME
              </span>
            </a>

            <p className="text-sm text-[#b0a090] font-light leading-relaxed max-w-sm">
              Nikmati Kopi Berkualitas dengan Rasa Premium Setiap Hari. Pengalaman kopi autentik dengan standar kualitas terbaik.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#18120d] border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#18120d] border border-[#d4af37]/30 text-[#d4af37] flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-display text-white font-bold text-base mb-4 tracking-wide">
              Navigasi
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#hero" className="hover:text-[#f0c84c] transition-colors">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-[#f0c84c] transition-colors">
                  Daftar Menu Kopi
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-[#f0c84c] transition-colors">
                  Keunggulan ARUME
                </a>
              </li>
              <li>
                <a href="#payment" className="hover:text-[#f0c84c] transition-colors">
                  Metode Pembayaran
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#f0c84c] transition-colors">
                  Hubungi Barista
                </a>
              </li>
            </ul>
          </div>

          {/* Location & Hours */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display text-white font-bold text-base mb-4 tracking-wide">
              Jam Operasional & Outlet
            </h4>
            <div className="space-y-3 text-sm text-[#b0a090]">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>{CONTACT_INFO.openingHours}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>{CONTACT_INFO.address}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8c7f72]">
          <p>
            Copyright © 2026 ARUME Coffee.
          </p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          </p>
        </div>

      </div>
    </footer>
  );
};
