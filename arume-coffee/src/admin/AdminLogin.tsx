// src/admin/AdminLogin.tsx

import React, { useState } from 'react';
import { LockKeyhole } from 'lucide-react';

type AdminLoginProps = {
  onLoginSuccess: (secret: string) => void;
};

const API_BASE_URL =
  'https://arume-coffee-api-2.diyanaxl.workers.dev';

export function AdminLogin({
  onLoginSuccess
}: AdminLoginProps) {
  const [password, setPassword] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const secret =
      password.trim();

    if (!secret) {
      setError(
        'Masukkan password admin.'
      );

      return;
    }

    setLoading(true);
    setError('');

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/api/admin/products`,
          {
            method:
              'GET',

            headers: {
              'X-ADMIN-SECRET':
                secret
            }
          }
        );

      if (!response.ok) {
        throw new Error(
          'Password admin salah.'
        );
      }

      sessionStorage.setItem(
        'arume_admin_secret',
        secret
      );

      onLoginSuccess(
        secret
      );
    } catch (err) {
      console.error(
        'Admin login error:',
        err
      );

      setError(
        'Password admin salah atau server tidak dapat dihubungi.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f3ece2] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#15110d] border border-[#d4af37]/30 rounded-2xl p-8 shadow-2xl">

        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 flex items-center justify-center">

            <LockKeyhole className="w-6 h-6 text-[#d4af37]" />

          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2">
          Arume Admin
        </h1>

        <p className="text-center text-[#b7aa9a] mb-8">
          Masuk untuk mengelola stok produk
        </p>

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          <div>
            <label className="block text-sm mb-2 text-[#d8ccbc]">
              Password Admin
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Masukkan password admin"
              autoComplete="current-password"
              className="w-full bg-[#0f0c09] border border-[#3c3228] rounded-xl px-4 py-3 outline-none focus:border-[#d4af37] transition"
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#e2c256] disabled:opacity-60 text-black font-bold rounded-xl py-3 transition"
          >
            {loading
              ? 'Memeriksa...'
              : 'Masuk'}
          </button>

        </form>

        <a
          href="/"
          className="block text-center mt-6 text-sm text-[#a99d8f] hover:text-[#d4af37] transition"
        >
          ← Kembali ke Website
        </a>

      </div>

    </div>
  );
}
