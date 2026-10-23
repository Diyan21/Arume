import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard
} from 'lucide-react';

import { CoffeeMenuItem } from '../types';

interface OrderModalProps {
  item: CoffeeMenuItem | null;
  onClose: () => void;
  onAddToCart?: (customizedItem: any) => void;
  onDirectCheckout?: (customizedItem: any) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  item,
  onClose,
  onAddToCart,
  onDirectCheckout
}) => {
  if (!item) return null;

  /* =========================================================
     ORDER CUSTOMIZATION STATE
     ========================================================= */
  const [quantity, setQuantity] = useState(1);
  const [iceLevel, setIceLevel] = useState('Es Normal');
  const [sugarLevel, setSugarLevel] = useState('Gula Normal');
  const [notes, setNotes] = useState('');

  /* =========================================================
     PRICE CALCULATIONS
     ========================================================= */
  const subtotal = Number(item.price) * quantity;
  const formattedSubtotal = `Rp${subtotal.toLocaleString('id-ID')}`;

  /* =========================================================
     BUILD CUSTOMIZED ITEM DATA
     ========================================================= */
  const getCustomizedData = () => ({
    id: item.id,
    name: item.name,
    price: item.price,
    image: item.image,
    formattedPrice: item.formattedPrice,
    category: item.category,
    quantity,
    iceLevel,
    sugarLevel,
    notes: notes.trim(),
    subtotal
  });

  /* =========================================================
     HANDLERS
     ========================================================= */
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(getCustomizedData());
    }
    onClose();
  };

  const handleDirectCheckout = () => {
    if (onDirectCheckout) {
      onDirectCheckout(getCustomizedData());
    } else if (onAddToCart) {
      onAddToCart(getCustomizedData());
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card max-w-lg w-full rounded-3xl overflow-hidden border border-[#d4af37]/40 shadow-2xl relative bg-[#140e0a] animate-in zoom-in-95 duration-300">
        
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 border border-[#d4af37]/30 text-white flex items-center justify-center hover:bg-[#d4af37] hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER IMAGE & PRODUCT INFO */}
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140e0a] via-[#140e0a]/40 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-[#d4af37] text-black font-bold uppercase tracking-wider mb-1 inline-block">
                {item.category}
              </span>
              <h3 className="font-display text-2xl font-bold text-white">
                {item.name}
              </h3>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#a09080] block">
                Harga Satuan
              </span>
              <span className="font-display text-2xl font-bold gold-gradient-text">
                {item.formattedPrice}
              </span>
            </div>
          </div>
        </div>

        {/* BODY CUSTOMIZATION FORM */}
        <div className="p-6 space-y-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
          <p className="text-sm text-[#c2b4a3] font-light leading-relaxed">
            {item.description}
          </p>

          {/* QUANTITY */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel border border-[#d4af37]/20 bg-[#18120d]">
            <span className="text-sm font-semibold text-white">
              Jumlah Botol
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg bg-[#251c14] border border-[#d4af37]/30 text-white flex items-center justify-center hover:border-[#d4af37] transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-bold text-lg text-white min-w-[20px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-[#251c14] border border-[#d4af37]/30 text-white flex items-center justify-center hover:border-[#d4af37] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ICE + SUGAR OPTIONS */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#b8a898] uppercase mb-1.5">
                Level Es
              </label>
              <select
                value={iceLevel}
                onChange={e => setIceLevel(e.target.value)}
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
                onChange={e => setSugarLevel(e.target.value)}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Gula Normal">Normal</option>
                <option value="Less Sugar">Less Sugar</option>
                <option value="Extra Sweet">Extra Sweet</option>
                <option value="No Sugar">No Sugar</option>
              </select>
            </div>
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-xs font-semibold text-[#b8a898] uppercase mb-1.5">
              Catatan Pesanan
            </label>
            <input
              type="text"
              placeholder="Contoh: Pisahkan es"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-5 border-t border-[#2a2018] bg-[#120d09]/95 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-[11px] text-[#8e8072] uppercase block">
                Subtotal
              </span>
              <span className="text-xs text-[#a09080]">
                {quantity}x @ {item.formattedPrice}
              </span>
            </div>

            <span className="font-display text-2xl font-bold gold-gradient-text">
              {formattedSubtotal}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-3">
            {/* BUTTON 1: ADD TO CART */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-3 px-4 rounded-xl border border-[#d4af37]/60 bg-[#1e1610] hover:bg-[#2b2017] text-[#d4af37] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>+ Keranjang</span>
            </button>

            {/* BUTTON 2: DIRECT CHECKOUT */}
            <button
              type="button"
              onClick={handleDirectCheckout}
              className="gold-gradient-btn py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-black" />
              <span>Bayar Langsung</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
