import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  CreditCard,
  Loader2,
  MapPin,
  Store,
  Truck,
  RefreshCcw,
  ShoppingBag,
  Trash2
} from 'lucide-react';

/* =========================================================
   API BASE URL
   ========================================================= */
const API_BASE_URL = 'https://arume-coffee-api-2.diyanaxl.workers.dev';

/* =========================================================
   TYPES
   ========================================================= */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  quantity: number;
  category?: string;
  image?: string;
  iceLevel?: string;
  sugarLevel?: string;
  notes?: string;
}

export interface StoreLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  postalCode?: string;
}

export interface CustomerProfile {
  id?: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
}

export interface ShippingRate {
  id: number;
  min_distance: number;
  max_distance: number;
  fee: number;
  active: boolean;
}

interface CartCheckoutModalProps {
  cartItems: CartItem[];
  storeLocation: StoreLocation;
  customerProfile?: CustomerProfile | null;
  onClose: () => void;
  onRemoveItem?: (index: number) => void;
}

/* =========================================================
   COMPONENT
   ========================================================= */
export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  cartItems,
  storeLocation,
  customerProfile,
  onClose,
  onRemoveItem
}) => {
  /* =========================================================
     CUSTOMER DATA STATE
     ========================================================= */
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  /* =========================================================
     DELIVERY & LOCATION STATE
     ========================================================= */
  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerLatitude, setCustomerLatitude] = useState<number | null>(null);
  const [customerLongitude, setCustomerLongitude] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(true);

  /* =========================================================
     CHECKOUT STATE & IDEMPOTENCY
     ========================================================= */
  const [loading, setLoading] = useState(false);
  const checkoutIdRef = useRef<string | null>(null);

  /* =========================================================
     AUTO-FILL PROFILE DATA
     ========================================================= */
  useEffect(() => {
    if (!customerProfile) {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setDeliveryAddress('');
      return;
    }

    setCustomerName(customerProfile.full_name || '');
    setCustomerEmail(customerProfile.email || '');
    setCustomerPhone(customerProfile.phone || '');
    setDeliveryAddress(customerProfile.address || '');
  }, [customerProfile]);

  /* =========================================================
     LOAD SHIPPING RATES FROM BACKEND
     ========================================================= */
  const loadShippingRates = async () => {
    setShippingLoading(true);
    setShippingError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/shipping`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || 'Gagal mengambil tarif ongkir.');
      }

      const rawRates =
        result?.data?.shipping_rates ||
        result?.data?.rates ||
        result?.shipping_rates ||
        result?.rates ||
        [];

      const normalizedRates: ShippingRate[] = Array.isArray(rawRates)
        ? rawRates
            .map((rate: any) => ({
              id: Number(rate.id),
              min_distance: Number(rate.min_distance),
              max_distance: Number(rate.max_distance),
              fee: Number(rate.fee),
              active: rate.active !== false
            }))
            .filter(
              rate =>
                Number.isFinite(rate.min_distance) &&
                Number.isFinite(rate.max_distance) &&
                Number.isFinite(rate.fee) &&
                rate.active
            )
            .sort((a, b) => a.max_distance - b.max_distance)
        : [];

      setShippingRates(normalizedRates);
    } catch (error) {
      console.error('Load shipping rates error:', error);
      setShippingRates([]);
      setShippingError('Tarif ongkir belum dapat dimuat.');
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    loadShippingRates();
  }, []);

  /* =========================================================
     DISTANCE CALCULATOR (HAVERSINE)
     ========================================================= */
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const earthRadius = 6371;
    const toRadians = (degree: number) => degree * (Math.PI / 180);

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  };

  const calculateShippingFee = (distance: number) => {
    const sortedRates = [...shippingRates].sort(
      (a, b) => Number(a.max_distance) - Number(b.max_distance)
    );

    const matchedRate = sortedRates.find(rate => {
      const min = Number(rate.min_distance);
      const max = Number(rate.max_distance);
      return distance >= min && distance <= max;
    });

    if (!matchedRate) return null;
    return Number(matchedRate.fee);
  };

  const handleGetLocation = () => {
    if (!deliveryEnabled) return;

    if (shippingRates.length === 0) {
      alert('Tarif ongkir belum tersedia. Silakan muat ulang tarif.');
      return;
    }

    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung fitur lokasi GPS.');
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      position => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCustomerLatitude(latitude);
        setCustomerLongitude(longitude);

        const distance = calculateDistance(
          storeLocation.latitude,
          storeLocation.longitude,
          latitude,
          longitude
        );

        const roundedDistance = Math.round(distance * 100) / 100;
        setDistanceKm(roundedDistance);

        const fee = calculateShippingFee(roundedDistance);

        if (fee === null) {
          setShippingFee(0);
          setDeliveryAvailable(false);
        } else {
          setShippingFee(fee);
          setDeliveryAvailable(true);
        }

        setLocationLoading(false);
      },
      error => {
        console.error('Location error:', error);
        setLocationLoading(false);
        let msg = 'Gagal mendeteksi lokasi GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser.';
        }
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const selectPickup = () => {
    setDeliveryEnabled(false);
    setCustomerLatitude(null);
    setCustomerLongitude(null);
    setDistanceKm(null);
    setShippingFee(0);
    setDeliveryAvailable(true);
  };

  const selectDelivery = () => {
    setDeliveryEnabled(true);
    setDeliveryAvailable(true);
  };

  /* =========================================================
     TOTAL CALCULATIONS FOR ALL ITEMS IN CART
     ========================================================= */
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const activeShippingFee =
    deliveryEnabled && distanceKm !== null && deliveryAvailable ? shippingFee : 0;

  const grandTotal = cartSubtotal + activeShippingFee;

  const formattedSubtotal = `Rp${cartSubtotal.toLocaleString('id-ID')}`;
  const formattedShippingFee = `Rp${activeShippingFee.toLocaleString('id-ID')}`;
  const formattedGrandTotal = `Rp${grandTotal.toLocaleString('id-ID')}`;

  /* =========================================================
     SUBMIT MULTI-ITEM CHECKOUT TO XENDIT
     ========================================================= */
  const handleCheckoutXendit = async () => {
    if (cartItems.length === 0) {
      alert('Keranjang belanja Anda masih kosong.');
      return;
    }

    if (!customerName.trim()) {
      alert('Mohon isi Nama Lengkap Anda terlebih dahulu.');
      return;
    }

    if (deliveryEnabled) {
      if (!deliveryAddress.trim()) {
        alert('Mohon isi alamat pengiriman.');
        return;
      }
      if (customerLatitude === null || customerLongitude === null) {
        alert('Mohon tekan "Gunakan Lokasi Saya" untuk menghitung ongkir.');
        return;
      }
      if (!deliveryAvailable) {
        alert('Alamat pengiriman berada di luar jangkauan.');
        return;
      }
    }

    if (loading) return;

    if (!checkoutIdRef.current) {
      checkoutIdRef.current = crypto.randomUUID();
    }

    setLoading(true);

    try {
      // 1. Kirim Semua Item di Keranjang ke Backend Worker
      const orderPayload = {
        checkout_id: checkoutIdRef.current,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim() || null,
          phone: customerPhone.trim() || null
        },
        delivery: deliveryEnabled
          ? {
              enabled: true,
              type: 'delivery',
              address: deliveryAddress.trim(),
              latitude: customerLatitude,
              longitude: customerLongitude
            }
          : {
              enabled: false,
              type: 'pickup'
            },
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          notes: `${item.iceLevel || 'Es Normal'}, ${item.sugarLevel || 'Gula Normal'}${
            item.notes ? ` - ${item.notes}` : ''
          }`
        }))
      };

      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        alert(`Gagal Buat Pesanan: ${orderResult?.message || orderResult?.error || 'Error Backend'}`);
        setLoading(false);
        return;
      }

      const orderNumber =
        orderResult?.data?.order_number ||
        orderResult?.data?.order?.order_number ||
        orderResult?.order_number;

      if (!orderNumber) {
        alert('Order Number tidak dikembalikan oleh server.');
        setLoading(false);
        return;
      }

      // 2. Minta Redirect Link Xendit ke Backend
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber })
      });

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        alert(`Gagal Buat Payment Xendit: ${paymentResult?.message || paymentResult?.error || 'Error Xendit'}`);
        setLoading(false);
        return;
      }

      // Deteksi semua kemungkinan nama field URL Xendit dari response Worker
      const paymentUrl =
        paymentResult?.data?.redirect_url ||
        paymentResult?.data?.payment_link_url ||
        paymentResult?.data?.invoice_url ||
        paymentResult?.data?.payment_url ||
        paymentResult?.data?.url ||
        paymentResult?.data?.payment?.redirect_url ||
        paymentResult?.data?.payment?.payment_link_url ||
        paymentResult?.data?.payment?.invoice_url ||
        paymentResult?.redirect_url ||
        paymentResult?.payment_link_url ||
        paymentResult?.invoice_url ||
        paymentResult?.payment_url ||
        paymentResult?.url ||
        paymentResult?.payment?.redirect_url ||
        paymentResult?.payment?.invoice_url ||
        paymentResult?.actions?.[0]?.url;

      if (!paymentUrl) {
        alert('Format Response Xendit dari Server:\n' + JSON.stringify(paymentResult, null, 2));
        setLoading(false);
        return;
      }

      // Direct Redirect ke Halaman Pembayaran Xendit
      checkoutIdRef.current = null;
      window.location.href = paymentUrl;

    } catch (error: any) {
      console.error('Xendit Checkout Error:', error);
      alert('Terjadi kesalahan koneksi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     RENDER UI
     ========================================================= */
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card max-w-lg w-full rounded-3xl overflow-hidden border border-[#d4af37]/40 shadow-2xl relative bg-[#140e0a] animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 border-b border-[#2a2018] flex items-center justify-between shrink-0 bg-[#120d09]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Ringkasan Pesanan Keranjang
              </h3>
              <p className="text-[11px] text-[#8e8072]">
                {cartItems.length} Variasi Produk Terpilih
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#18120d] border border-[#d4af37]/20 text-[#8e8072] flex items-center justify-center hover:text-white hover:border-[#d4af37] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          
          {/* DAFTAR ITEM DI KERANJANG */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block">
              Detail Pesanan
            </span>

            {cartItems.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-[#18120d] border border-[#2a2018]">
                <p className="text-xs text-[#8e8072]">Keranjang belanja Anda kosong.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="p-3.5 rounded-2xl bg-[#18120d] border border-[#2a2018] flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{item.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] font-semibold">
                          {item.quantity}x
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-[#a09080]">
                        {[item.iceLevel, item.sugarLevel, item.notes].filter(Boolean).join(' • ')}
                      </p>

                      <p className="text-xs text-[#d4af37] font-semibold pt-0.5">
                        Rp{(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>

                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(index)}
                        disabled={loading}
                        className="text-[#605448] hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFORMASI PEMESAN */}
          <div className="space-y-3 pt-3 border-t border-[#2a2018]">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block">
              Informasi Pemesan
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama Lengkap *"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                disabled={loading}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
              />

              <input
                type="email"
                placeholder="Email (Opsional)"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <input
              type="tel"
              placeholder="Nomor WhatsApp (Opsional)"
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              disabled={loading}
              className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* METODE PENGAMBILAN & LOKASI */}
          <div className="space-y-4 pt-3 border-t border-[#2a2018]">
            <span className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block">
              Metode Pengambilan
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={selectPickup}
                disabled={loading}
                className={`rounded-2xl p-3.5 border transition-all text-left ${
                  !deliveryEnabled
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-[#382d24] bg-[#18120d]'
                }`}
              >
                <Store className={`w-4 h-4 mb-1.5 ${!deliveryEnabled ? 'text-[#d4af37]' : 'text-[#8e8072]'}`} />
                <p className="text-xs font-bold text-white">Ambil Sendiri</p>
                <p className="text-[10px] text-[#8e8072]">Tanpa ongkir</p>
              </button>

              <button
                type="button"
                onClick={selectDelivery}
                disabled={loading}
                className={`rounded-2xl p-3.5 border transition-all text-left ${
                  deliveryEnabled
                    ? 'border-[#d4af37] bg-[#d4af37]/10'
                    : 'border-[#382d24] bg-[#18120d]'
                }`}
              >
                <Truck className={`w-4 h-4 mb-1.5 ${deliveryEnabled ? 'text-[#d4af37]' : 'text-[#8e8072]'}`} />
                <p className="text-xs font-bold text-white">Delivery</p>
                <p className="text-[10px] text-[#8e8072]">Cek ongkir via GPS</p>
              </button>
            </div>

            {!deliveryEnabled ? (
              <div className="rounded-xl bg-[#18120d] border border-[#30261e] p-3">
                <p className="text-xs text-white font-semibold">{storeLocation.name}</p>
                <p className="text-[11px] text-[#8e8072] mt-0.5">{storeLocation.address}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  placeholder="Alamat lengkap pengiriman *"
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  disabled={loading}
                  rows={2}
                  className="w-full bg-[#18120d] border border-[#d4af37]/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#605448] focus:outline-none focus:border-[#d4af37] resize-none"
                />

                {shippingError && (
                  <div className="rounded-xl bg-red-950/20 border border-red-500/20 p-2.5 flex justify-between items-center">
                    <p className="text-xs text-red-300">{shippingError}</p>
                    <button
                      type="button"
                      onClick={loadShippingRates}
                      className="text-xs text-[#d4af37] font-semibold flex items-center gap-1"
                    >
                      <RefreshCcw className="w-3 h-3" /> Coba lagi
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={loading || locationLoading || shippingLoading || shippingRates.length === 0}
                  className="w-full py-2.5 rounded-xl border border-[#d4af37]/40 bg-[#251c14] text-[#d4af37] text-xs font-bold flex items-center justify-center gap-2 hover:border-[#d4af37] transition-colors"
                >
                  {locationLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mengecek Lokasi...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5" />
                      {distanceKm !== null ? `Lokasi Terdeteksi (${distanceKm} km)` : 'Gunakan Lokasi Saya'}
                    </>
                  )}
                </button>

                {distanceKm !== null && (
                  <div className="bg-[#18120d] rounded-xl border border-[#d4af37]/20 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#8e8072]">
                      <span>Jarak Estimasi:</span>
                      <span className="text-white font-semibold">{distanceKm} km</span>
                    </div>
                    {deliveryAvailable ? (
                      <div className="flex justify-between text-[#8e8072]">
                        <span>Ongkos Kirim:</span>
                        <span className="text-[#d4af37] font-bold">{formattedShippingFee}</span>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400 font-semibold pt-1">
                        Lokasi di luar jangkauan pengiriman.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FIXED FOOTER */}
        <div className="p-5 border-t border-[#2a2018] bg-[#120d09]/95 shrink-0 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-[11px] text-[#8e8072] space-y-0.5">
                <div>Subtotal Produk: {formattedSubtotal}</div>
                {deliveryEnabled && <div>Ongkir: {deliveryAvailable ? formattedShippingFee : 'Luar Area'}</div>}
              </div>
              <span className="text-[11px] text-[#8e8072] uppercase font-bold block mt-1">
                Total Bayar
              </span>
            </div>

            <span className="font-display text-2xl font-bold gold-gradient-text">
              {formattedGrandTotal}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCheckoutXendit}
            disabled={loading || cartItems.length === 0 || (deliveryEnabled && !deliveryAvailable)}
            className="w-full gold-gradient-btn py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span>Memproses Pesanan...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 text-black" />
                <span>Bayar Sekarang via Xendit</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
