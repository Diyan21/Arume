import { useState } from 'react';
import { CartCheckoutModal } from './components/CartCheckoutModal';

// Contoh di komponen utama kamu (misal App.tsx)
export function App() {
  const [isCartCheckoutOpen, setIsCartCheckoutOpen] = useState(false);
  const [cartItems, setCartItems] = useState([...]); // Array item dari keranjang kamu

  const storeLocation = {
    name: 'Arume Coffee',
    address: 'Madrasah Ibtidaiyah Negeri 7, Cengkareng Timur, Jakarta Barat 11730',
    latitude: -6.1408, // Sesuaikan koordinat kedai
    longitude: 106.7320
  };

  const handleRemoveCartItem = (indexToRemove: number) => {
    setCartItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      {/* Tombol Buka Keranjang / Checkout */}
      <button onClick={() => setIsCartCheckoutOpen(true)}>
        Checkout Keranjang ({cartItems.length})
      </button>

      {/* Pop-up Modal Checkout Keranjang */}
      {isCartCheckoutOpen && (
        <CartCheckoutModal
          cartItems={cartItems}
          storeLocation={storeLocation}
          onClose={() => setIsCartCheckoutOpen(false)}
          onRemoveItem={handleRemoveCartItem}
        />
      )}
    </div>
  );
}
