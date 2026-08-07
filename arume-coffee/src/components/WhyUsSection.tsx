import React from 'react';
import { Coffee, Flame, Sparkles, Award, ShieldCheck } from 'lucide-react';
import { WHY_US_ITEMS } from '../data/coffeeData';

export const WhyUsSection: React.FC = () => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bean':
        return <Flame className="w-8 h-8 text-[#e5b869]" />;
      case 'Coffee':
        return <Coffee className="w-8 h-8 text-[#e5b869]" />;
      case 'Sparkles':
        return <Sparkles className="w-8 h-8 text-[#e5b869]" />;
      case 'Award':
        return <Award className="w-8 h-8 text-[#e5b869]" />;
      default:
        return <Coffee className="w-8 h-8 text-[#e5b869]" />;
    }
  };

  return (
    <section id="why-us" className="py-24 relative overflow-hidden bg-[#090705]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#d4af37]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#d4af37]/30 mb-4">
            <ShieldCheck className="w-4 h-4 text-[#e5b869]" />
            <span className="text-xs font-semibold text-[#e5b869] tracking-wider uppercase">
              Komitmen Kualitas ARUME
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Mengapa Memilih <span className="gold-gradient-text">ARUME</span>?
          </h2>
          <p className="text-[#c2b4a3] text-base sm:text-lg font-light leading-relaxed">
            Kami menghadirkan pengalaman kopi istimewa melalui standar pembuatan terbaik dari hulu ke hilir.
          </p>
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              className="glass-card p-8 rounded-3xl flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Background Number Accent */}
              <span className="absolute top-3 right-5 text-6xl font-display font-black text-white/[0.03] select-none group-hover:text-[#d4af37]/10 transition-colors">
                0{idx + 1}
              </span>

              {/* Glowing Icon Container */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2a1e14] to-[#120d09] border border-[#d4af37]/30 flex items-center justify-center mb-6 shadow-xl shadow-black/60 group-hover:scale-110 group-hover:border-[#d4af37] transition-all duration-300">
                {getIcon(item.icon)}
              </div>

              {/* Title */}
              <h3 className="font-display text-xl font-bold text-white mb-3 group-hover:text-[#f0c84c] transition-colors">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#b3a494] font-light leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
