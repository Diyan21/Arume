import {
  CoffeeMenuItem,
  PaymentMethodItem,
} from '../types';

export const COFFEE_MENU: CoffeeMenuItem[] = [
  {
    id: 'prod-01',
    name: 'Arumeya Aren Latte',
    description:
      'Espresso pilihan berpadu dengan susu creamy dan manis lembut gula aren, menghadirkan aroma hangat khas Arumeya.',
    price: 15000,
    formattedPrice: 'Rp15.000',
    image: '/images/menu/arumeya-aren-latte.jpg',
    category: 'Signature',
    rating: 4.9,
    reviewsCount: 342,
    isBestSeller: true,
    tags: [
      'Signature',
      'Gula Aren',
      'Creamy',
    ],
  },

  {
    id: 'prod-02',
    name: 'Arumeya Butterscotch',
    description:
      'Espresso dengan sentuhan butterscotch lembut dan aroma karamel yang hangat, creamy, dan elegan.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image:
      '/images/menu/arumeya-butterscotch-latte.jpg',
    category: 'Signature',
    rating: 4.9,
    reviewsCount: 289,
    isBestSeller: true,
    tags: [
      'Favorite',
      'Butterscotch',
      'Creamy',
    ],
  },

  {
    id: 'prod-03',
    name: 'Arumeya Hazelnut Latte',
    description:
      'Latte lembut dengan karakter espresso dan aroma hazelnut yang nutty, harum, dan terasa hangat di setiap tegukan.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image:
      '/images/menu/arumeya-hazelnut-latte.jpg',
    category: 'Specialty',
    rating: 4.8,
    reviewsCount: 210,
    tags: [
      'Hazelnut',
      'Nutty',
      'Smooth',
    ],
  },

  {
    id: 'prod-04',
    name: 'Arumeya Banana Latte',
    description:
      'Perpaduan espresso, susu creamy, dan sentuhan banana yang lembut untuk rasa unik, ringan, dan menyenangkan.',
    price: 18000,
    formattedPrice: 'Rp18.000',
    image:
      '/images/menu/arumeya-banana-latte.jpg',
    category: 'Specialty',
    rating: 4.8,
    reviewsCount: 178,
    tags: [
      'Banana',
      'Creamy',
      'Unique',
    ],
  },

  {
    id: 'prod-05',
    name: 'Arumeya Americano',
    description:
      'Espresso murni dengan karakter kopi yang bersih, aromatik, dan bold untuk menikmati rasa asli kopi ARUME.',
    price: 10000,
    formattedPrice: 'Rp10.000',
    image:
      '/images/menu/arumeya-americano.jpg',
    category: 'Classics',
    rating: 4.9,
    reviewsCount: 415,
    tags: [
      'Classic',
      'Bold',
      'No Milk',
    ],
  },

  // =====================================
  // KOPI TORAJA
  // =====================================

  {
    id: 'prod-06',
    name: 'Arume Toraja Blend 250g',
    description:
      'Kopi Toraja racikan ARUME dengan perpaduan Arabica dan Robusta pilihan. Menghadirkan aroma kopi yang kuat, rasa bold namun tetap smooth dan seimbang. Cocok dinikmati sebagai kopi harian dengan karakter khas Nusantara.',

    // ===================================
    // HARGA TAMPILAN FRONTEND SAJA
    // ===================================
    // Harga asli checkout TIDAK memakai
    // nilai ini.
    //
    // Backend akan mengambil harga
    // prod-06 langsung dari Supabase.
    // ===================================
    price: 55000,
    formattedPrice: 'Rp55.000',

    image:
      '/images/menu/arume-toraja-250g.jpg',
    category: 'Coffee Beans',
    rating: 4.9,
    reviewsCount: 0,
    isBestSeller: true,
    tags: [
      'Toraja',
      'Arabica & Robusta',
      '250g',
    ],
  },

  {
    id: 'prod-07',
    name: 'Arume Toraja Blend 500g',
    description:
      'Kopi Toraja racikan ARUME dengan perpaduan Arabica dan Robusta pilihan. Menghadirkan aroma kopi yang kuat, rasa bold namun tetap smooth dan seimbang. Pilihan lebih hemat untuk pecinta kopi yang menikmati kopi setiap hari.',
    price: 105000,
    formattedPrice: 'Rp105.000',
    image:
      '/images/menu/arume-toraja-500g.jpg',
    category: 'Coffee Beans',
    rating: 4.9,
    reviewsCount: 0,
    tags: [
      'Toraja',
      'Arabica & Robusta',
      '500g',
    ],
  },

  {
    id: 'prod-08',
    name: 'Arume Toraja Blend 1kg',
    description:
      'Kopi Toraja racikan ARUME dengan perpaduan Arabica dan Robusta pilihan dalam kemasan 1 kg. Aroma kuat, body mantap, serta rasa yang smooth dan seimbang. Cocok untuk kebutuhan rumah, kantor, maupun usaha.',
    price: 200000,
    formattedPrice: 'Rp200.000',
    image:
      '/images/menu/arume-toraja-1kg.jpg',
    category: 'Coffee Beans',
    rating: 4.9,
    reviewsCount: 0,
    tags: [
      'Toraja',
      'Arabica & Robusta',
      '1kg',
      'Best Value',
    ],
  },
];

export const WHY_US_ITEMS = [
  {
    id: 'beans',
    title: 'Biji Kopi Berkualitas',
    description:
      'Menggunakan biji kopi pilihan dengan karakter rasa dan aroma yang terjaga untuk menghasilkan pengalaman minum kopi yang nikmat.',
    icon: 'Bean',
  },

  {
    id: 'fresh',
    title: 'Fresh Brew Setiap Hari',
    description:
      'Biji kopi digiling dan diseduh segar saat pesanan dibuat untuk menjaga aroma serta cita rasa kopi.',
    icon: 'Coffee',
  },

  {
    id: 'price',
    title: 'Harga Terjangkau',
    description:
      'Nikmati kopi berkualitas dengan cita rasa premium dan harga yang tetap ramah di kantong.',
    icon: 'Sparkles',
  },

  {
    id: 'flavor',
    title: 'Rasa Premium',
    description:
      'Racikan khas ARUME menghadirkan perpaduan rasa yang seimbang, aromatik, dan nikmat untuk dinikmati setiap hari.',
    icon: 'Award',
  },
];

export const PAYMENT_METHODS: PaymentMethodItem[] = [
  {
    id: 'qris',
    name: 'QRIS',
    type: 'Instant QR Scan',
    description:
      'Scan & bayar instan dari semua aplikasi M-Banking & E-Wallet.',
    iconType: 'qris',
  },

  {
    id: 'bank',
    name: 'Transfer Bank',
    type: 'Virtual Account / Direct',
    description:
      'Menerima transfer BCA, Mandiri, BRI, BNI & Bank Digital.',
    iconType: 'bank',
  },

  {
    id: 'dana',
    name: 'DANA',
    type: 'E-Wallet',
    description:
      'Pembayaran praktis & aman via saldo DANA.',
    iconType: 'e-wallet',
  },

  {
    id: 'gopay',
    name: 'GoPay',
    type: 'E-Wallet',
    description:
      'Bayar mudah langsung dari aplikasi Gojek / GoPay.',
    iconType: 'e-wallet',
  },

  {
    id: 'ovo',
    name: 'OVO',
    type: 'E-Wallet',
    description:
      'Transaksi cepat menggunakan akun OVO Anda.',
    iconType: 'e-wallet',
  },

  {
    id: 'shopeepay',
    name: 'ShopeePay',
    type: 'E-Wallet',
    description:
      'Nikmati kemudahan bayar dengan ShopeePay.',
    iconType: 'e-wallet',
  },

  {
    id: 'cash',
    name: 'Tunai (Cash)',
    type: 'Pembayaran Langsung',
    description:
      'Bayar tunai saat pengambilan di outlet atau layanan COD local.',
    iconType: 'cash',
  },
];

export const CONTACT_INFO = {
  brandName: 'ARUME',

  tagline:
    'Nikmati Kopi Berkualitas dengan Rasa Premium Setiap Hari.',

  phoneDisplay:
    '0878-8122-7088',

  phoneRaw:
    '6287881227088',

  whatsappUrl:
    'https://wa.me/6287881227088',

  address:
    'Jl. Cluster Britania E8/10 & Crown Golf No.58',

  openingHours:
    'Buka Setiap Saat: 18:00 - 22:00 WIB',

  instagram:
    '@diyanaxl',
};
