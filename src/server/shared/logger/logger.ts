import { env } from "../../config/env";

type LogLevel = "INFO" | "WARN" | "ERROR" | "SECURITY" | "AI" | "MEDIA" | "AUTH" | "DB";

type LogEntry = {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  env: string;
};

function format(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    env: env.nodeEnv,
  };
}

function sanitize(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sensitiveKeys = ["password", "token", "secret", "api_key", "apiKey", "authorization", "cookie"];
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    clean[k] = sensitiveKeys.some((s) => k.toLowerCase().includes(s)) ? "[DISEMBUNYIKAN]" : v;
  }
  return clean;
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    const entry = format("INFO", message, sanitize(context));
    if (env.isDev) console.log(JSON.stringify(entry));
    else console.log(JSON.stringify(entry));
  },
  warn(message: string, context?: Record<string, unknown>) {
    const entry = format("WARN", message, sanitize(context));
    console.warn(JSON.stringify(entry));
  },
  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const entry = format("ERROR", message, {
      ...sanitize(context),
      error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
    });
    console.error(JSON.stringify(entry));
  },
  security(message: string, context?: Record<string, unknown>) {
    const entry = format("SECURITY", message, sanitize(context));
    console.error(JSON.stringify(entry));
  },
  ai(message: string, context?: Record<string, unknown>) {
    const entry = format("AI", message, sanitize(context));
    console.log(JSON.stringify(entry));
  },
  media(message: string, context?: Record<string, unknown>) {
    const entry = format("MEDIA", message, sanitize(context));
    console.log(JSON.stringify(entry));
  },
  auth(message: string, context?: Record<string, unknown>) {
    const entry = format("AUTH", message, sanitize(context));
    console.log(JSON.stringify(entry));
  },
  db(message: string, context?: Record<string, unknown>) {
    if (!env.isDev) return;
    const entry = format("DB", message, sanitize(context));
    console.log(JSON.stringify(entry));
  },
};
