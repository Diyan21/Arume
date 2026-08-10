import { supabase, isConfigured } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

// Default Seed Data for Arume Coffee
export const SEED_PRODUCTS = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Kopi Gula Aren',
    description: 'Espresso dengan susu segar dan gula aren asli yang gurih nan manis.',
    price: 15000,
    image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
    name: 'Kopi Butterscotch',
    description: 'Paduan espresso, cream butterscotch aromatik, dan susu pilihan.',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
    name: 'Kopi Hazelnut',
    description: 'Aroma hazelnut nan lembut berpadu serasi dengan espresso khas Arume.',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
    name: 'Kopi Banana Latte',
    description: 'Sensasi rasa pisang manis lembut berpadu sempurna dengan iced latte.',
    price: 18000,
    image_url: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
    name: 'Americano',
    description: 'Double shot espresso murni tanpa gula, segar dan kaya rasa.',
    price: 10000,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * GET /api/products
 * Get all active products
 */
export const getProducts = async (req, res, next) => {
  try {
    if (!isConfigured) {
      return successResponse(res, 'Berhasil mengambil daftar produk (Mock Data)', SEED_PRODUCTS);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching products:', error);
      // Fallback to seed data if database is empty or error occurs
      return successResponse(res, 'Berhasil mengambil daftar produk', SEED_PRODUCTS);
    }

    if (!data || data.length === 0) {
      return successResponse(res, 'Berhasil mengambil daftar produk', SEED_PRODUCTS);
    }

    return successResponse(res, 'Berhasil mengambil daftar produk', data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/products/:id
 * Get single product by ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isConfigured) {
      const product = SEED_PRODUCTS.find((p) => p.id === id);
      if (!product) {
        return errorResponse(res, 'Produk tidak ditemukan', 'PRODUCT_NOT_FOUND', 404);
      }
      return successResponse(res, 'Berhasil mengambil detail produk', product);
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      // Fallback check in seed data
      const seedMatch = SEED_PRODUCTS.find((p) => p.id === id);
      if (seedMatch) {
        return successResponse(res, 'Berhasil mengambil detail produk', seedMatch);
      }
      return errorResponse(res, 'Produk tidak ditemukan', 'PRODUCT_NOT_FOUND', 404);
    }

    return successResponse(res, 'Berhasil mengambil detail produk', data);
  } catch (err) {
    next(err);
  }
};
