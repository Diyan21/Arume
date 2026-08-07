export interface CoffeeMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  image: string;
  category: 'Signature' | 'Classics' | 'Specialty';
  rating: number;
  reviewsCount: number;
  isBestSeller?: boolean;
  tags?: string[];
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: string;
  description: string;
  iconType: 'qris' | 'bank' | 'e-wallet' | 'cash';
}

export interface OrderItem {
  item: CoffeeMenuItem;
  quantity: number;
  iceLevel: 'Normal Ice' | 'Less Ice' | 'No Ice';
  sugarLevel: 'Normal' | 'Less Sugar' | 'Extra Sweet' | 'No Sugar';
  note?: string;
}
