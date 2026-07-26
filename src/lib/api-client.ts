/**
 * API Client — Centralized fetch wrapper untuk backend server
 * Semua request ke backend WAJIB melalui file ini
 *
 * Support kompatibilitas ganda: res.success & res.sukses
 */

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return (import.meta as any).env?.VITE_API_URL || "";
  }
  return (import.meta as any).env?.VITE_API_URL || "http://localhost:3001";
}

// ── Response Types ─────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
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

// ── Fetch Helper ──────────────────────────────────────────────────────────────
async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  // Ambil token dari localStorage untuk fallback Authorization header
  let token: string | null = null;
  if (typeof window !== "undefined") {
    token =
      localStorage.getItem("bearer_token") ||
      localStorage.getItem("better-auth.session_token");
    if (token === "undefined" || token === "null") token = null;
  }

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    credentials: "include", // kirim cookie session
    headers: {
      ...defaultHeaders,
      ...(options.headers ?? {}),
    },
  });

  // Try to parse JSON response
  let json: any;
  try {
    json = await res.json();
  } catch {
    return {
      success: false,
      sukses: false,
      pesan: `Server error: ${res.status} ${res.statusText}`,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }

  // Normalisasi flag success / sukses agar kompatibel dengan seluruh frontend routes
  const isSuccess = Boolean(json.sukses ?? json.success ?? (res.ok && json.data !== null));

  return {
    ...json,
    success: isSuccess,
    sukses: isSuccess,
    data: json.data ?? null,
    pesan: json.pesan ?? json.message ?? "",
    timestamp: json.timestamp ?? new Date().toISOString(),
  };
}

// ── API Methods ────────────────────────────────────────────────────────────────
export const api = {
  /** GET request */
  async get<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url = `${path}?${qs}`;
    }
    return fetchApi<T>(url, { method: "GET" });
  },

  /** POST request */
  async post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return fetchApi<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  /** PATCH request */
  async patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return fetchApi<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },

  /** DELETE request */
  async delete<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return fetchApi<T>(path, {
      method: "DELETE",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};

/** Helper: throw jika response tidak sukses */
export function assertSukses<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data === null) {
    throw new Error(res.pesan || "Terjadi kesalahan API");
  }
  return res.data as T;
}
