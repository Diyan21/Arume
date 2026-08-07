import React, { useState, useEffect } from 'react';
import { Coffee, MessageCircle, Menu as MenuIcon, X, Sparkles } from 'lucide-react';
import { CONTACT_INFO } from '../data/coffeeData';

interface NavbarProps {
  onOpenQuickOrder?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickOrder }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Beranda', href: '#hero' },
    { name: 'Menu Kopi', href: '#menu' },
    { name: 'Keunggulan', href: '#why-us' },
    { name: 'Pembayaran', href: '#payment' },
    { name: 'Kontak', href: '#contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0f0c09]/85 backdrop-blur-md border-b border-[#d4af37]/20 py-3 shadow-2xl shadow-black/80'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#d4af37] via-[#9a6f00] to-[#3a2818] p-0.5 shadow-lg shadow-[#d4af37]/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#0d0a07] rounded-full flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#e5b869] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-wider gold-gradient-text">
                ARUME
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#c99700]/80 uppercase -mt-1 font-sans">
                Coffee
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 glass-panel px-6 py-2 rounded-full border border-[#d4af37]/15">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-[#e0d6c8] hover:text-[#f0c84c] transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#d4af37] hover:after:w-full after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* CTA Action */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={CONTACT_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-gradient-btn px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 group"
            >
              <MessageCircle className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span>Pesan Sekarang</span>
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#1d1611]/80 border border-[#d4af37]/30 text-[#e0d6c8] hover:text-[#d4af37]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 p-5 rounded-2xl glass-panel border border-[#d4af37]/30 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-[#e0d6c8] hover:text-[#f0c84c] transition-colors py-1.5 border-b border-[#2a2018]"
                >
                  {link.name}
                </a>
              ))}
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="gold-gradient-btn w-full py-3 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 mt-2"
              >
                <MessageCircle className="w-4 h-4 text-black" />
                <span>Pesan Via WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
