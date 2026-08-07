import React, { useState } from 'react';
import { COFFEE_MENU } from '../data/coffeeData';
import { Coffee, Star, ShoppingBag, Sparkles, Plus, Check } from 'lucide-react';
import { CoffeeMenuItem } from '../types';

interface MenuSectionProps {
  onSelectMenu: (item: CoffeeMenuItem) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onSelectMenu }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Signature', 'Specialty', 'Classics'];

  const filteredMenu = activeCategory === 'All'
    ? COFFEE_MENU
    : COFFEE_MENU.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" className="py-24 relative overflow-hidden bg-[#0c0907]">
      {/* Glossy Accent Spotlights */}
      <div className="absolute top-1/3 left-0 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[#8b5a2b]/15 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#d4af37]/30 mb-4">
            <Coffee className="w-4 h-4 text-[#e5b869]" />
            <span className="text-xs font-semibold text-[#e5b869] tracking-wider uppercase">
              Pilihan Rasa Terbaik
            </span>
          </div>
          
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Menu Kopi <span className="gold-gradient-text">ARUME</span>
          </h2>
          <p className="text-[#c2b4a3] text-base sm:text-lg font-light leading-relaxed">
            Setiap cangkir diseduh dengan presisi tinggi dari biji kopi pilihan dan bahan-bahan premium berkualitas.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'gold-gradient-btn shadow-lg shadow-[#d4af37]/20 scale-105'
                    : 'glass-panel text-[#d6c9b8] hover:text-white border-transparent hover:border-[#d4af37]/30'
                }`}
              >
                {cat === 'All' ? 'Semua Menu' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMenu.map((item) => (
            <div
              key={item.id}
              className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group relative"
            >
              {/* Badge Tag */}
              {item.isBestSeller && (
                <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#d4af37] to-[#b8860b] text-black text-[11px] font-bold shadow-lg">
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>BEST SELLER</span>
                </div>
              )}

              {/* Card Image Header */}
              <div>
                <div className="relative h-60 overflow-hidden bg-[#18130e]">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-transparent to-black/30" />
                  
                  {/* Rating Tag */}
                  <div className="absolute bottom-3 left-4 flex items-center gap-1 px-2.5 py-1 rounded-lg glass-panel text-xs text-white">
                    <Star className="w-3.5 h-3.5 text-[#d4af37] fill-[#d4af37]" />
                    <span className="font-bold">{item.rating}</span>
                    <span className="text-[#a09080] text-[10px]">({item.reviewsCount})</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Title & Coffee Icon */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2a1f16] border border-[#d4af37]/30 flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-[#e5b869]" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-white group-hover:text-[#f0c84c] transition-colors">
                        {item.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#bcae9e] font-light leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#251b14] text-[#d4af37] border border-[#d4af37]/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Price & Action */}
              <div className="px-6 pb-6 pt-2 border-t border-[#2a2018] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#8e8072] uppercase tracking-wider block">Harga</span>
                  <span className="font-display text-2xl font-bold gold-gradient-text">
                    {item.formattedPrice}
                  </span>
                </div>

                <button
                  onClick={() => onSelectMenu(item)}
                  className="gold-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 group/btn"
                >
                  <ShoppingBag className="w-4 h-4 text-black group-hover/btn:scale-110 transition-transform" />
                  <span>Pesan</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
