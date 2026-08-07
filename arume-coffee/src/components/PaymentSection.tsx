import React from 'react';
import { CreditCard, QrCode, Wallet, Banknote, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { PAYMENT_METHODS } from '../data/coffeeData';

export const PaymentSection: React.FC = () => {
  const getPaymentIcon = (type: string, name: string) => {
    switch (name.toLowerCase()) {
      case 'qris':
        return <QrCode className="w-8 h-8 text-[#f0c84c]" />;
      case 'transfer bank':
        return <CreditCard className="w-8 h-8 text-[#e5b869]" />;
      case 'tunai (cash)':
        return <Banknote className="w-8 h-8 text-[#22c55e]" />;
      default:
        return <Wallet className="w-8 h-8 text-[#e5b869]" />;
    }
  };

  return (
    <section id="payment" className="py-24 relative overflow-hidden bg-[#0c0907]">
      {/* Glossy Background Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Payment Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#d4af37]/30 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Top Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#d4af37]/30 mb-4">
              <CreditCard className="w-4 h-4 text-[#e5b869]" />
              <span className="text-xs font-semibold text-[#e5b869] tracking-wider uppercase">
                Transaksi Praktis & Aman
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              Metode Pembayaran
            </h2>
            <p className="text-[#c2b4a3] text-base font-light">
              Menerima pembayaran melalui berbagai pilihan non-tunai & tunai yang mudah:
            </p>
          </div>

          {/* Payment Methods Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className="glass-panel p-5 rounded-2xl flex flex-col items-center text-center border border-[#d4af37]/15 hover:border-[#d4af37]/50 hover:bg-[#201811]/90 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1d1610] border border-[#d4af37]/20 flex items-center justify-center mb-3 group-hover:border-[#d4af37] transition-colors">
                  {getPaymentIcon(method.iconType, method.name)}
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-[#f0c84c] transition-colors">
                  {method.name}
                </h3>
                <span className="text-[11px] text-[#9a8c7d] mt-1 font-light">
                  {method.type}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#2a2018] text-xs text-[#b8a99a]">
            <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
            <span>Semua transaksi diverifikasi instan & bebas biaya tersembunyi.</span>
          </div>

        </div>

      </div>
    </section>
  );
};
