export type PaginationParams = {
  halaman?: number;
  per_halaman?: number;
};

export type PaginationMeta = {
  halaman: number;
  per_halaman: number;
  total: number;
  total_halaman: number;
};
