import { getSupabaseClient, SEED_PRODUCTS } from '../config/supabase.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * GET /api/products
 * Returns all available products
 */
export const getProducts = async (c) => {
  try {
    const supabase = getSupabaseClient(c.env);

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return successResponse(c, 'Berhasil mengambil daftar produk', data);
      }
    }

    // Fallback to seed products if Supabase is empty or not yet configured
    return successResponse(c, 'Berhasil mengambil daftar produk (Master Catalog)', SEED_PRODUCTS);
  } catch (err) {
    return errorResponse(c, 'Gagal mengambil data produk', err.message, 500);
  }
};

/**
 * GET /api/products/:id
 * Returns a specific product by ID
 */
export const getProductById = async (c) => {
  try {
    const id = c.req.param('id');
    const supabase = getSupabaseClient(c.env);

    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        return successResponse(c, 'Berhasil mengambil detail produk', data);
      }
    }

    // Search in seed products
    const seedProduct = SEED_PRODUCTS.find((p) => p.id === id);
    if (seedProduct) {
      return successResponse(c, 'Berhasil mengambil detail produk', seedProduct);
    }

    return errorResponse(c, 'Produk tidak ditemukan', null, 404);
  } catch (err) {
    return errorResponse(c, 'Gagal mengambil detail produk', err.message, 500);
  }
};
