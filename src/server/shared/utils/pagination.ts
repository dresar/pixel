import type { PaginationMeta, PaginationParams } from "../types/pagination";

export function normalisasiPaginasi(params: PaginationParams): { halaman: number; per_halaman: number; offset: number } {
  const halaman = Math.max(1, Number(params.halaman ?? 1));
  const per_halaman = Math.min(100, Math.max(1, Number(params.per_halaman ?? 20)));
  const offset = (halaman - 1) * per_halaman;
  return { halaman, per_halaman, offset };
}

export function buatPaginasiMeta(total: number, halaman: number, per_halaman: number): PaginationMeta {
  return {
    halaman,
    per_halaman,
    total,
    total_halaman: Math.ceil(total / per_halaman),
  };
}
