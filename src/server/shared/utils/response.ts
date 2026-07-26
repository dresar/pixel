/**
 * Response Builder — Standar format response seluruh API
 * Semua endpoint WAJIB menggunakan fungsi-fungsi ini
 */

import type { Context } from "hono";

// ── Response Types ────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  sukses: boolean;
  pesan: string;
  data: T | null;
  kode?: string;
  meta?: PaginasiMeta;
  timestamp: string;
}

export interface PaginasiMeta {
  halaman: number;
  per_halaman: number;
  total: number;
  total_halaman: number;
}

// ── Response Builders ─────────────────────────────────────────────────────────

/** Response sukses standar */
export function sukses<T>(c: Context, pesan: string, data: T, status: number = 200) {
  return c.json<ApiResponse<T>>(
    {
      sukses: true,
      pesan,
      data,
      timestamp: new Date().toISOString(),
    },
    status as any,
  );
}

/** Response sukses dengan pagination */
export function terpaginasi<T>(
  c: Context,
  pesan: string,
  data: T[],
  meta: PaginasiMeta,
) {
  return c.json<ApiResponse<T[]>>(
    {
      sukses: true,
      pesan,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    200 as any,
  );
}

/** Response gagal/error */
export function gagal(
  c: Context,
  pesan: string,
  kode: string = "INTERNAL_ERROR",
  status: number = 400,
) {
  return c.json<ApiResponse<null>>(
    {
      sukses: false,
      pesan,
      data: null,
      kode,
      timestamp: new Date().toISOString(),
    },
    status as any,
  );
}

// ── Pagination Helper ─────────────────────────────────────────────────────────
export function buatPaginasiMeta(
  total: number,
  halaman: number,
  per_halaman: number,
): PaginasiMeta {
  return {
    halaman,
    per_halaman,
    total,
    total_halaman: Math.ceil(total / per_halaman),
  };
}

export function normalisasiPaginasi(data: { halaman?: number; per_halaman?: number }) {
  const halaman = Math.max(1, data.halaman ?? 1);
  const per_halaman = Math.min(50, Math.max(1, data.per_halaman ?? 20));
  const offset = (halaman - 1) * per_halaman;
  return { halaman, per_halaman, offset };
}
