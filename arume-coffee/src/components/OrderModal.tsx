import React, { useState } from 'react';
import { X, Coffee, ShoppingBag, Send, Plus, Minus, Star, Heart, CreditCard, Loader2 } from 'lucide-react';
import { CoffeeMenuItem } from '../types';
import { CONTACT_INFO } from '../data/coffeeData';

declare global {
  interface Window {
    snap: any;
  }
}

interface OrderModalProps {
  item: CoffeeMenuItem | null;
  onClose: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState('Es Normal');
  const [sugarLevel, setSugarLevel] = useState('Gula Normal');
  const [notes, setNotes] = useState('');
  
  // State Form Pembeli & Loading
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const totalPrice = item.price * quantity;
  const formattedTotalPrice = `Rp${totalPrice.toLocaleString('id-ID')}`;

  // Handler Checkout Midtrans API
  const handleCheckoutMidtrans = async () => {
    if (!customerName || !customerEmail) {
      alert('Mohon isi nama dan email Anda terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      // 1. Tembak API Worker
      const response = await fetch('https://arume-coffee-api.diyanaxl.workers.dev/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone || '081234567890',
          },
          items: [
            {
              product_id: item.id,
              quantity: quantity,
            },
          ],
          notes: `${iceLevel}, ${sugarLevel}${notes ? ` - ${notes}` : ''}`,
        }),
      });

      const result = await response.json();

      // 2. Eksekusi Popup Midtrans Snap
      if (result.success && result.data?.payment?.token) {
        window.snap.pay(result.data.payment.token, {
          onSuccess: function (res: any) {
            alert('Pembayaran Berhasil! Pesanan Anda sedang diproses.');
            console.log('Success:', res);
            onClose();
          },
          onPending: function (res: any) {
            alert('Menunggu pembayaran diselesaikan.');
            console.log('Pending:', res);
            onClose();
          },
          onError: function (err: any) {
            alert('Pembayaran gagal, silakan coba lagi.');
            console.error('Error:', err);
          },
          onClose: function () {
            alert('Anda membatalkan pembayaran.');
          },
        });
      } else {
        alert('Gagal membuat pesanan: ' + (result.message || 'Error Server'));
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Terjadi kesalahan koneksi ke server API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card max-w-lg w-full rounded-3xl overflow-hidden border border-[#d4af37]/40 shadow-2xl relative animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-[#d4af37]/30 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Image */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#120e0b] via-[#120e0b]/40 to-transparent" />
          
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#d4af37] text-black font-bold uppercase tracking-wider mb-1 inline-block">
                {item.category}
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                {item.name}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#a09080] block">Harga Satuan</span>
              <span className="font-display text-2xl font-bold gold-gradient-text">
                {item.formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          
          <p className="text-sm text-[#c2b4a3] font-light leading-relaxed">
            {item.description}
          </p>

          {/* Form Data Pembeli */}
          <div className="space-y-3 pt-2 border-t border-[#2a2018]">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block">
              Informasi Pemesan
            </span>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama Lengkap *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
                required
              />
              <input
                type="email"
                placeholder="Email *"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
                required
              />
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-[#d4af37]/20">
            <span className="text-sm font-semibold text-white">Jumlah Pesanan</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-[#251c14] border border-[#d4af37]/30 text-white flex items-center justify-center hover:border-[#d4af37]"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg text-white min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[#251c14] border border-[#d4af37]/30 text-white flex items-center justify-center hover:border-[#d4af37]"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ice & Sugar Options */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#b8a898] uppercase mb-1.5">
                Level Es
              </label>
              <select
                value={iceLevel}
                onChange={(e) => setIceLevel(e.target.value)}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Es Normal">Es Normal</option>
                <option value="Less Ice">Less Ice</option>
                <option value="No Ice">No Ice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8a898] uppercase mb-1.5">
                Level Gula
              </label>
              <select
                value={sugarLevel}
                onChange={(e) => setSugarLevel(e.target.value)}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Gula Normal">Normal</option>
                <option value="Less Sugar">Less Sugar</option>
                <option value="Extra Sweet">Extra Sweet</option>
                <option value="No Sugar">No Sugar</option>
              </select>
            </div>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-xs font-semibold text-[#b8a898] uppercase mb-1.5">
              Catatan Pesanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Pisahkan es / minta sedotan ramah lingkungan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#2a2018] bg-[#120d09]/90 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#8e8072] uppercase block">Total Bayar</span>
            <span className="font-display text-2xl font-bold gold-gradient-text">
              {formattedTotalPrice}
            </span>
          </div>

          <button
            onClick={handleCheckoutMidtrans}
            disabled={loading}
            className="gold-gradient-btn px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-black" />
                <span>Bayar Sekarang</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
