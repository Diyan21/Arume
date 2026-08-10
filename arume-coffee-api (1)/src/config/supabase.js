import { createClient } from '@supabase/supabase-js';

// Default seed products for Arume Coffee
export const SEED_PRODUCTS = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Kopi Gula Aren',
    description: 'Espresso dengan susu segar dan gula aren asli yang gurih nan manis.',
    price: 15000,
    category: 'Coffee',
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Kopi Butterscotch',
    description: 'Paduan espresso, cream butterscotch aromatik, dan susu pilihan.',
    price: 18000,
    category: 'Coffee',
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Kopi Hazelnut',
    description: 'Aroma hazelnut nan lembut berpadu serasi dengan espresso khas Arume.',
    price: 18000,
    category: 'Coffee',
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    name: 'Kopi Banana Latte',
    description: 'Sensasi rasa pisang manis lembut berpadu sempurna dengan iced latte.',
    price: 18000,
    category: 'Coffee',
    image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    name: 'Americano',
    description: 'Double shot espresso murni tanpa gula, segar dan kaya rasa.',
    price: 10000,
    category: 'Coffee',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
    name: 'Matcha Latte Premium',
    description: 'Uji Matcha Jepang premium dipadu susu segar dingin yang lembut.',
    price: 20000,
    category: 'Non-Coffee',
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17',
    name: 'Croissant Butter Classic',
    description: 'Pastry renyah berlapis dengan aroma mentega Prancis yang gurih.',
    price: 15000,
    category: 'Pastry',
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80',
    is_active: true,
  }
];

// Transient in-memory store for dev/testing fallback when Supabase is not configured
export const memoryStore = {
  orders: new Map(),
  payments: new Map(),
  customers: new Map(),
};

/**
 * Get Supabase client using environment variables passed from Cloudflare Worker request context
 */
export const getSupabaseClient = (env) => {
  const url = env?.SUPABASE_URL || process?.env?.SUPABASE_URL;
  const key = env?.SUPABASE_SERVICE_ROLE_KEY || process?.env?.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key && url.startsWith('http') && !url.includes('your-project') && !key.includes('your-supabase')) {
    try {
      return createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (e) {
      console.warn('Supabase initialization warning:', e.message);
      return null;
    }
  }
  return null;
};
