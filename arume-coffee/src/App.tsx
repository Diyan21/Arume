import React, {
  useEffect,
  useState
} from 'react';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { WhyUsSection } from './components/WhyUsSection';
import { PaymentSection } from './components/PaymentSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { OrderModal } from './components/OrderModal';
import { CartCheckoutModal, CartItem } from './components/CartCheckoutModal';
import { OrderStatus } from './components/OrderStatus';
import { CustomerAuth } from './components/CustomerAuth';

import { supabase } from './lib/supabase';

import {
  AdminLogin
} from './admin/AdminLogin';

import {
  AdminStock
} from './admin/AdminStock';

import {
  CoffeeMenuItem
} from './types';

import {
  CONTACT_INFO
} from './data/coffeeData';

import {
  Coffee,
  MessageCircle,
  ReceiptText,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';


/* =========================================================
   STORE LOCATION
   ========================================================= */

const STORE_LOCATION = {
  name: 'Arumeya Coffee',
  address: 'Madrasah Ibtidaiyah Negeri 7, Cengkareng Timur, Jakarta Barat 11730',
  latitude: -6.145680,
  longitude: 106.736081,
  postalCode: '11730',
};


/* =========================================================
   TYPES & STORAGE KEYS
   ========================================================= */

const ACTIVE_ORDER_STORAGE_KEY = 'arume_active_order';

interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  const isAdminPage =
    window.location.pathname === '/admin' ||
    window.location.pathname === '/admin/';
  
  const [selectedItem, setSelectedItem] = useState<CoffeeMenuItem | null>(null);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [customerAuthLoading, setCustomerAuthLoading] = useState(true);

  const [adminSecret, setAdminSecret] = useState<string | null>(
    () => sessionStorage.getItem('arume_admin_secret')
  );

  /* =========================================================
     CART STATE
     ========================================================= */

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Tambah item kustomisasi dari OrderModal ke Keranjang
  const handleAddToCart = (customizedItem: any) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        i =>
          i.id === customizedItem.id &&
          i.iceLevel === customizedItem.iceLevel &&
          i.sugarLevel === customizedItem.sugarLevel &&
          i.notes === customizedItem.notes
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += customizedItem.quantity;
        return updated;
      }
      return [...prev, customizedItem];
    });
  };

  // Langsung checkout 1 item dari OrderModal
  const handleDirectCheckout = (customizedItem: any) => {
    handleAddToCart(customizedItem);
    setIsCheckoutModalOpen(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCartItems(prev =>
      prev
        .map((item, idx) => {
          if (idx === index) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (indexToRemove: number) => {
    setCartItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const totalCartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalCartPrice = cartItems.reduce(
    (acc, curr) => acc + Number(curr.price) * curr.quantity,
    0
  );


  /* =========================================================
     ACTIVE ORDER & STATUS
     ========================================================= */

  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY)
  );

  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [paymentCancelledOrder, setPaymentCancelledOrder] = useState<string | null>(null);


  /* =========================================================
     CUSTOMER AUTH
     ========================================================= */

  const loadCustomerProfile = async (userId: string, email: string | null) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, phone, address')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Load customer profile error:', error);
      setCustomerProfile({
        id: userId,
        full_name: null,
        phone: null,
        address: null,
        email
      });
      return;
    }

    setCustomerProfile({
      id: userId,
      full_name: data?.full_name || null,
      phone: data?.phone || null,
      address: data?.address || null,
      email
    });
  };

  useEffect(() => {
    if (isAdminPage) {
      setCustomerAuthLoading(false);
      return;
    }

    let active = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!active) return;

        const user = data.session?.user;
        if (user) {
          await loadCustomerProfile(user.id, user.email || null);
        } else {
          setCustomerProfile(null);
        }
      } catch (error) {
        console.error('Initialize customer auth error:', error);
        if (active) setCustomerProfile(null);
      } finally {
        if (active) setCustomerAuthLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!active) return;

        const user = session?.user;
        if (user) {
          await loadCustomerProfile(user.id, user.email || null);
        } else {
          setCustomerProfile(null);
        }
        setCustomerAuthLoading(false);
      }
    );

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [isAdminPage]);

  const handleCustomerLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCustomerProfile(null);
    } catch (error: any) {
      console.error('Customer logout error:', error);
      alert(error?.message || 'Gagal keluar dari akun.');
    }
  };


  /* =========================================================
     SAVE / REMOVE ORDER
     ========================================================= */

  const saveActiveOrder = (orderNumber: string) => {
    const normalized = String(orderNumber || '').trim();
    if (!normalized) return;
    localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, normalized);
    setActiveOrderNumber(normalized);
  };

  const removeActiveOrder = () => {
    localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    setActiveOrderNumber(null);
    setShowOrderStatus(false);
  };


  /* =========================================================
     PAYMENT RETURN HANDLER
     ========================================================= */

  useEffect(() => {
    if (isAdminPage) return;

    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const orderNumber = params.get('order');

    if (payment === 'success' && orderNumber) {
      saveActiveOrder(orderNumber);
      setShowOrderStatus(true);
      setPaymentCancelledOrder(null);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    if (payment === 'cancelled') {
      setPaymentCancelledOrder(orderNumber || 'Pesanan');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [isAdminPage]);


  /* =========================================================
     ADMIN PAGE
     ========================================================= */

  if (isAdminPage) {
    if (!adminSecret) {
      return <AdminLogin onLoginSuccess={(secret) => setAdminSecret(secret)} />;
    }
    return (
      <AdminStock
        secret={adminSecret}
        onLogout={() => {
          sessionStorage.removeItem('arume_admin_secret');
          setAdminSecret(null);
        }}
      />
    );
  }


  /* =========================================================
     MAIN WEBSITE
     ========================================================= */

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f3ece2] font-sans selection:bg-[#d4af37] selection:text-black relative pb-24">

      {/* NAVBAR WITH CART PROPS */}
      <Navbar
        customerName={
          customerAuthLoading
            ? null
            : customerProfile?.full_name || customerProfile?.email || null
        }
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setCustomerAuthOpen(true)}
        onLogout={handleCustomerLogout}
      />

      <main>
        <HeroSection />

        <MenuSection
          onSelectMenu={(item) => {
            setSelectedItem(item);
          }}
        />

        <WhyUsSection />
        <PaymentSection />
        <ContactSection />
      </main>

      <Footer />

      <CustomerAuth
        open={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
      />

      {/* =====================================================
          ORDER MODAL (KUSTOMISASI 1 ITEM)
          ===================================================== */}

      {selectedItem && (
        <OrderModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
          onDirectCheckout={handleDirectCheckout}
        />
      )}

      {/* =====================================================
          CART CHECKOUT MODAL (BAYAR SEMUA ITEM VIA XENDIT)
          ===================================================== */}

      {isCheckoutModalOpen && (
        <CartCheckoutModal
          cartItems={cartItems}
          storeLocation={STORE_LOCATION}
          customerProfile={customerProfile}
          onClose={() => setIsCheckoutModalOpen(false)}
          onRemoveItem={removeFromCart}
        />
      )}

      {/* =====================================================
          FLOATING CART BAR (Bottom Trigger)
          ===================================================== */}

      {totalCartCount > 0 && !activeOrderNumber && (
        <div className="fixed bottom-5 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-[380px]">
          <div className="rounded-2xl border border-[#d4af37]/40 bg-[#17100b]/95 backdrop-blur-md p-4 shadow-2xl shadow-black/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-[#d4af37] text-black flex items-center justify-center font-bold">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#17100b]">
                  {totalCartCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-[#9f8d7a] uppercase tracking-wider font-medium">Keranjang Kamu</p>
                <p className="text-base font-bold text-[#d4af37]">
                  Rp {totalCartPrice.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e2c256] text-black font-bold text-sm transition active:scale-95"
            >
              Lihat Pesanan
            </button>
          </div>
        </div>
      )}

      {/* =====================================================
          CART DRAWER / MODAL
          ===================================================== */}

      {isCartOpen && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#13100d] h-full flex flex-col border-l border-[#d4af37]/20 shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#211810] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#d4af37]" />
                <h3 className="text-lg font-bold text-[#f3ece2]">Keranjang Belanja</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-lg text-[#ad9f91] hover:text-white hover:bg-[#211810]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-[#8c7b6c]">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>Keranjang kamu masih kosong, bro.</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="p-3.5 rounded-xl bg-[#1d1712] border border-[#2b2118] flex items-center gap-3.5"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate text-[#f3ece2]">{item.name}</h4>
                      <p className="text-[11px] text-[#a09080]">
                        {[item.iceLevel, item.sugarLevel, item.notes].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-xs text-[#d4af37] font-semibold mt-1">
                        Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                      </p>
                      
                      {/* Qty Controller */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          className="w-6 h-6 rounded bg-[#2a2118] hover:bg-[#382c20] text-[#f3ece2] flex items-center justify-center transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, 1)}
                          className="w-6 h-6 rounded bg-[#2a2118] hover:bg-[#382c20] text-[#f3ece2] flex items-center justify-center transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="p-5 border-t border-[#211810] bg-[#17110c] space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#9f8d7a]">Total Pembayaran</span>
                  <span className="text-xl font-bold text-[#d4af37]">
                    Rp {totalCartPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#d4af37] hover:bg-[#e2c256] text-black font-bold transition text-center"
                >
                  Lanjut ke Pembayaran
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL ORDER STATUS */}
      {activeOrderNumber && showOrderStatus && (
        <OrderStatus
          orderNumber={activeOrderNumber}
          onClose={(finalStatus) => {
            const normalizedStatus = String(finalStatus || '').trim().toLowerCase();
            if (['completed', 'failed', 'refunded'].includes(normalizedStatus)) {
              removeActiveOrder();
              return;
            }
            setShowOrderStatus(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* MINI ACTIVE ORDER POPUP */}
      {activeOrderNumber && !showOrderStatus && !paymentCancelledOrder && (
        <div className="fixed bottom-5 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-[390px]">
          <div className="rounded-2xl border border-[#d4af37]/30 bg-[#17100b] shadow-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOrderStatus(true)}
              className="w-full p-4 flex items-center gap-4 text-left hover:bg-[#1d150f] transition"
            >
              <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center">
                <Coffee className="w-6 h-6 text-[#d4af37]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-[0.15em] text-[#9f8d7a]">Pesanan Aktif</p>
                <p className="text-base font-bold text-[#f3ece2] mt-1">Lihat Status Pesanan</p>
                <p className="text-xs font-mono text-[#d4af37] mt-1 truncate">{activeOrderNumber}</p>
              </div>
              <ReceiptText className="w-5 h-5 text-[#d4af37]" />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      {!activeOrderNumber && !paymentCancelledOrder && !totalCartCount && (
        <a
          href={CONTACT_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#25d366] text-white shadow-2xl flex items-center gap-2.5 hover:scale-110 active:scale-95 transition-all duration-300 group"
          aria-label="Pesan via WhatsApp"
        >
          <MessageCircle className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline font-bold text-sm pr-1">Pesan Fast-Response</span>
        </a>
      )}

    </div>
  );
}
