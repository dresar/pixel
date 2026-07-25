import { ERROR_CODES, type ErrorCode } from "./error-codes";

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly field: string | null;

  constructor(message: string, code: ErrorCode, statusCode: number, field: string | null = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.field = field;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field: string | null = null) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400, field);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Sesi tidak valid. Silakan masuk kembali.") {
    super(message, ERROR_CODES.AUTHENTICATION_ERROR, 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Anda tidak memiliki izin untuk mengakses fitur ini.") {
    super(message, ERROR_CODES.AUTHORIZATION_ERROR, 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.NOT_FOUND, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.CONFLICT, 409);
    this.name = "ConflictError";
  }
}

export class BusinessError extends AppError {
  constructor(message: string) {
    super(message, ERROR_CODES.BUSINESS_ERROR, 422);
    this.name = "BusinessError";
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = "Layanan eksternal tidak tersedia. Silakan coba beberapa saat lagi.") {
    super(message, ERROR_CODES.EXTERNAL_SERVICE_ERROR, 503);
    this.name = "ExternalServiceError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = "Terlalu banyak permintaan. Silakan tunggu sebentar.") {
    super(message, ERROR_CODES.RATE_LIMIT_ERROR, 429);
    this.name = "RateLimitError";
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
