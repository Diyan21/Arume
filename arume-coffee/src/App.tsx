import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { WhyUsSection } from './components/WhyUsSection';
import { PaymentSection } from './components/PaymentSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { CoffeeMenuItem } from './types';
import { CONTACT_INFO } from './data/coffeeData';
import { MessageCircle } from 'lucide-react';

export default function App() {
  const [selectedItem, setSelectedItem] = useState<CoffeeMenuItem | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f3ece2] font-sans selection:bg-[#d4af37] selection:text-black relative">
      {/* Navbar */}
      <Navbar />

      {/* Main Landing Sections */}
      <main>
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Menu Coffee Section */}
        <MenuSection onSelectMenu={(item) => setSelectedItem(item)} />

        {/* 3. Why Choose Arume Section */}
        <WhyUsSection />

        {/* 4. Payment Section */}
        <PaymentSection />

        {/* 5. Contact Section */}
        <ContactSection />
      </main>

      {/* 6. Footer */}
      <Footer />

      {/* Interactive Order Modal */}
      <OrderModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      {/* Floating Sticky WhatsApp Button */}
      <a
        href={CONTACT_INFO.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#25d366] hover:to-[#15803d] text-white shadow-2xl shadow-emerald-950/60 flex items-center gap-2.5 hover:scale-110 active:scale-95 transition-all duration-300 border border-emerald-400/30 group"
        aria-label="Pesan via WhatsApp"
      >
        <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-bold text-sm pr-1">Pesan Fast-Response</span>
      </a>
    </div>
  );
}
