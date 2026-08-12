import { CoffeeMenuItem, PaymentMethodItem } from '../types';

export const COFFEE_MENU: CoffeeMenuItem[] = [
  {
    id: 'kopi-gula-aren',
    name: 'Kopi Gula Aren',
    description: 'Espresso Arabica pilihan dipadu gula aren murni organik dan susu segar creamy.',
    price: 15000,
    formattedPrice: 'Rp15.000',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    category: 'Signature',
    rating: 4.9,
    reviewsCount: 342,
    isBestSeller: true,
    tags: ['Best Seller', 'Gula Aren Asli', 'Sweet & Creamy']
  },
  {
    id: 'kopi-butterscotch',
    name: 'Kopi Butterscotch',
    description: 'Espresso kaya rasa dengan paduan aroma butterscotch gurih, karamel lezat, & milk foam.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=800&q=80',
    category: 'Signature',
    rating: 4.9,
    reviewsCount: 289,
    isBestSeller: true,
    tags: ['Favorite', 'Rich Butterscotch', 'Creamy']
  },
  {
    id: 'kopi-hazelnut',
    name: 'Kopi Hazelnut',
    description: 'Perpaduan espresso mantap dan aroma hazelnut nutty khas dengan susu yang lembut.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    category: 'Specialty',
    rating: 4.8,
    reviewsCount: 210,
    tags: ['Nutty Flavor', 'Smooth Finish']
  },
  {
    id: 'kopi-banana-latte',
    name: 'Kopi Banana Latte',
    description: 'Kombinasi susu pisang manis alami creamy dengan shot espresso segar yang unik.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=80',
    category: 'Specialty',
    rating: 4.8,
    reviewsCount: 178,
    tags: ['Unique Taste', 'Banana Cream']
  },
  {
    id: 'americano',
    name: 'Americano',
    description: 'Kopi hitam klasik hasil ekstraksi espresso murni 100% biji pilihan khas ARUME.',
    price: 10000,
    formattedPrice: 'Rp10.000',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    category: 'Classics',
    rating: 4.9,
    reviewsCount: 415,
    tags: ['Classic Brew', '100% Arabica', 'Zero Sugar Option']
  }
];

export const WHY_US_ITEMS = [
  {
    id: 'beans',
    title: 'Biji Kopi Berkualitas',
    description: 'Dipetik langsung dari perkebunan kopi terbaik dengan seleksi 100% biji kopi pilihan berkualitas tinggi.',
    icon: 'Bean'
  },
  {
    id: 'fresh',
    title: 'Fresh Brew Setiap Hari',
    description: 'Biji kopi digiling & diseduh segar secara langsung saat pesanan Anda dibuat oleh barista berpengalaman.',
    icon: 'Coffee'
  },
  {
    id: 'price',
    title: 'Harga Terjangkau',
    description: 'Nikmati cita rasa espresso premium kelas kafe mewah dengan harga yang sangat ramah di kantong.',
    icon: 'Sparkles'
  },
  {
    id: 'flavor',
    title: 'Rasa Premium',
    description: 'Racikan resep istimewa house-blend ARUME yang menghasilkan konsistensi rasa konsisten & nikmat.',
    icon: 'Award'
  }
];

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'qris',
    name: 'QRIS',
    type: 'Instant QR Scan',
    description: 'Scan & bayar instan dari semua aplikasi M-Banking & E-Wallet.',
    iconType: 'qris'
  },
  {
    id: 'bank',
    name: 'Transfer Bank',
    type: 'Virtual Account / Direct',
    description: 'Menerima transfer BCA, Mandiri, BRI, BNI & Bank Digital.',
    iconType: 'bank'
  },
  {
    id: 'dana',
    name: 'DANA',
    type: 'E-Wallet',
    description: 'Pembayaran praktis & aman via saldo DANA.',
    iconType: 'e-wallet'
  },
  {
    id: 'gopay',
    name: 'GoPay',
    type: 'E-Wallet',
    description: 'Bayar mudah langsung dari aplikasi Gojek / GoPay.',
    iconType: 'e-wallet'
  },
  {
    id: 'ovo',
    name: 'OVO',
    type: 'E-Wallet',
    description: 'Transaksi cepat menggunakan akun OVO Anda.',
    iconType: 'e-wallet'
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'E-Wallet',
    description: 'Nikmati kemudahan bayar dengan ShopeePay.',
    iconType: 'e-wallet'
  },
  {
    id: 'cash',
    name: 'Tunai (Cash)',
    type: 'Pembayaran Langsung',
    description: 'Bayar tunai saat pengambilan di outlet atau layanan COD local.',
    iconType: 'cash'
  }
];

export const CONTACT_INFO = {
  brandName: 'ARUME',
  tagline: 'Nikmati Kopi Berkualitas dengan Rasa Premium Setiap Hari.',
  phoneDisplay: '0878-8122-7088',
  phoneRaw: '6287881227088',
  whatsappUrl: 'https://wa.me/6287881227088',
  address: 'Jl. Cluster Britania E8/10',
  openingHours: 'Buka Setiap Saat: 18:00 - 22:00 WIB',
  instagram: '@diyanaxl'
};
