/**
 * AppError — Custom application error class
 * Semua error bisnis WAJIB menggunakan class ini
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(message: string = "Data tidak ditemukan") {
    return new AppError(message, "NOT_FOUND", 404);
  }

  static unauthorized(message: string = "Anda tidak memiliki akses") {
    return new AppError(message, "UNAUTHORIZED", 401);
  }

  static forbidden(message: string = "Akses ditolak") {
    return new AppError(message, "FORBIDDEN", 403);
  }

  static badRequest(message: string) {
    return new AppError(message, "BAD_REQUEST", 400);
  }

  static conflict(message: string) {
    return new AppError(message, "CONFLICT", 409);
  }

  static internal(message: string = "Terjadi kesalahan sistem") {
    return new AppError(message, "INTERNAL_ERROR", 500);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
