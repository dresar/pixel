import { redirect } from "@tanstack/react-router";
import type { ApiError, ApiMeta, ApiResponse, PaginatedResponse } from "../types/response";
import type { PaginationMeta } from "../types/pagination";

export function sukses<T>(message: string, data: T, meta?: Partial<ApiMeta>): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    errors: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function gagal(
  message: string,
  code: string,
  errors: ApiError[] | null = null,
): ApiResponse<null> {
  if (code === "AUTHENTICATION_ERROR") {
    throw redirect({ to: "/masuk" });
  }

  return {
    success: false,
    message,
    data: null,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

export function terpaginasi<T>(
  message: string,
  data: T[],
  pagination: PaginationMeta,
): PaginatedResponse<T> {
  return {
    success: true,
    message,
    data,
    errors: null,
    meta: {
      halaman: pagination.halaman,
      per_halaman: pagination.per_halaman,
      total: pagination.total,
      total_halaman: pagination.total_halaman,
      timestamp: new Date().toISOString(),
    },
  };
}
