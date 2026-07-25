export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: ApiError[] | null;
  meta: ApiMeta | null;
};

export type ApiError = {
  field: string | null;
  message: string;
  code?: string;
};

export type ApiMeta = {
  halaman?: number;
  per_halaman?: number;
  total?: number;
  total_halaman?: number;
  timestamp: string;
};

export type PaginatedResponse<T> = ApiResponse<T[]> & {
  meta: ApiMeta;
};
