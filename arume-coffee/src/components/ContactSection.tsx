import React, { useState } from 'react';
import { MessageCircle, Phone, Clock, MapPin, Coffee, Send, Check } from 'lucide-react';
import { CONTACT_INFO, COFFEE_MENU } from '../data/coffeeData';

export const ContactSection: React.FC = () => {
  const [selectedCoffee, setSelectedCoffee] = useState(COFFEE_MENU[0].name);
  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState('Es Normal');
  const [sugarLevel, setSugarLevel] = useState('Gula Normal');
  const [notes, setNotes] = useState('');

  const handleSendCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Halo ARUME Coffee! Saya mau pesan:%0A%0A- *${selectedCoffee}* (${quantity}x)%0A- Opsi: ${iceLevel}, ${sugarLevel}${notes ? `%0A- Catatan: ${notes}` : ''}%0A%0AMohon diproses ya. Terima kasih!`;
    window.open(`${CONTACT_INFO.whatsappUrl}?text=${message}`, '_blank');
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden bg-[#090705]">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#d4af37]/8 rounded-full blur-[180px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Contact Card Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#d4af37]/30 mb-4">
            <MessageCircle className="w-4 h-4 text-[#22c55e]" />
            <span className="text-xs font-semibold text-[#22c55e] tracking-wider uppercase">
              Layanan Pesanan Cepat
            </span>
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Pesan Sekarang Melalui WhatsApp
          </h2>
          <p className="text-[#c2b4a3] text-base font-light">
            Hubungi barista kami secara langsung untuk pemesanan cepat, delivery area, atau tanya menu hari ini.
          </p>
        </div>

        {/* Main Glass Contact Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-[#d4af37]/30 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-5 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#2a2018] pb-8 lg:pb-0 lg:pr-8">
              
              {/* WhatsApp Icon Banner */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6 shadow-lg shadow-emerald-950/40">
                <MessageCircle className="w-8 h-8 text-[#22c55e]" />
              </div>

              <h3 className="font-display text-2xl font-bold text-white mb-2">
                ARUME Direct WhatsApp
              </h3>
              <p className="text-sm text-[#b0a090] font-light mb-6">
                Klik tombol di bawah untuk terhubung langsung dengan Tim Barista ARUME.
              </p>

              {/* Phone Display Box */}
              <div className="glass-panel p-4 rounded-2xl border border-[#d4af37]/20 mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#201811] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#d4af37]" />
                </div>
                <div>
                  <span className="text-[11px] text-[#8e8072] uppercase block">Nomor WhatsApp</span>
                  <span className="font-display text-xl font-bold text-white tracking-wider">
                    {CONTACT_INFO.phoneDisplay}
                  </span>
                </div>
              </div>

              {/* Primary Green WhatsApp Button */}
              <a
                href={CONTACT_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#25d366] hover:to-[#15803d] text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/30 hover:scale-[1.02] transition-all duration-300 group"
              >
                <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                <span>Chat via WhatsApp</span>
              </a>

              {/* Info Badges */}
              <div className="mt-8 space-y-3 pt-6 border-t border-[#2a2018]">
                <div className="flex items-center gap-3 text-xs text-[#b0a090]">
                  <Clock className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{CONTACT_INFO.openingHours}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#b0a090]">
                  <MapPin className="w-4 h-4 text-[#d4af37] shrink-0" />
                  <span>{CONTACT_INFO.address}</span>
                </div>
              </div>

            </div>

            {/* Right Interactive Order Builder Column */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#d4af37]/20">
                
                <div className="flex items-center gap-2 mb-6">
                  <Coffee className="w-5 h-5 text-[#e5b869]" />
                  <h4 className="font-display text-lg font-bold text-white">
                    Form Pesan Cepat Kopi (Opsional)
                  </h4>
                </div>

                <form onSubmit={handleSendCustomOrder} className="space-y-4">
                  {/* Select Menu Item */}
                  <div>
                    <label className="block text-xs font-semibold text-[#c5b5a5] uppercase mb-1.5">
                      Pilih Varian Kopi
                    </label>
                    <select
                      value={selectedCoffee}
                      onChange={(e) => setSelectedCoffee(e.target.value)}
                      className="w-full bg-[#16100b] border border-[#d4af37]/30 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                    >
                      {COFFEE_MENU.map((item) => (
                        <option key={item.id} value={item.name}>
                          {item.name} — {item.formattedPrice}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity & Options */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#c5b5a5] uppercase mb-1.5">
                        Jumlah (Cup)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-[#16100b] border border-[#d4af37]/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#c5b5a5] uppercase mb-1.5">
                        Level Es
                      </label>
                      <select
                        value={iceLevel}
                        onChange={(e) => setIceLevel(e.target.value)}
                        className="w-full bg-[#16100b] border border-[#d4af37]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="Es Normal">Es Normal</option>
                        <option value="Sedikit Es (Less Ice)">Less Ice</option>
                        <option value="Tanpa Es (No Ice)">No Ice</option>
                      </select>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-[#c5b5a5] uppercase mb-1.5">
                        Tingkat Manis
                      </label>
                      <select
                        value={sugarLevel}
                        onChange={(e) => setSugarLevel(e.target.value)}
                        className="w-full bg-[#16100b] border border-[#d4af37]/30 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="Gula Normal">Normal</option>
                        <option value="Less Sugar">Less Sugar</option>
                        <option value="Extra Sweet">Extra Sweet</option>
                        <option value="Tanpa Gula">No Sugar</option>
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[#c5b5a5] uppercase mb-1.5">
                      Catatan Tambahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Titip di pos satpam / minta extra espresso shot"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-[#16100b] border border-[#d4af37]/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#685c50] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full gold-gradient-btn py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  >
                    <Send className="w-4 h-4 text-black" />
                    <span>Kirim Pesanan ke WhatsApp</span>
                  </button>
                </form>

              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
