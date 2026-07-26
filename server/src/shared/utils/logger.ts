/**
 * Logger — Simple structured logger untuk production cPanel
 * Tidak menggunakan library berat, cukup console yang terstruktur
 */

import { env } from "../../config/env.js";

type LogLevel = "info" | "warn" | "error" | "debug";

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (data !== undefined) {
    const extra = data instanceof Error ? data.stack ?? data.message : JSON.stringify(data);
    return `${prefix} ${message} | ${extra}`;
  }
  return `${prefix} ${message}`;
}

export const logger = {
  info(message: string, data?: unknown) {
    console.log(formatLog("info", message, data));
  },
  warn(message: string, data?: unknown) {
    console.warn(formatLog("warn", message, data));
  },
  error(message: string, data?: unknown) {
    console.error(formatLog("error", message, data));
  },
  debug(message: string, data?: unknown) {
    if (env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, data));
    }
  },
};
