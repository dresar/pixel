/**
 * Auth Middleware — Validasi sesi Better-Auth (Cookie + Bearer Token Fallback)
 */

import type { Context, Next } from "hono";
import { eq } from "drizzle-orm";
import { auth } from "../../features/auth/auth.config.js";
import { db } from "../../config/database.js";
import { sessions, users } from "../../database/schema/index.js";
import { gagal } from "../utils/response.js";
import { logger } from "../utils/logger.js";

export async function authMiddleware(c: Context, next: Next) {
  let session = null;

  try {
    // 1. Coba validasi via Better-Auth (mengecek Cookie & Authorization header)
    session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
  } catch (err) {
    logger.debug("Better-Auth getSession error, mencoba fallback DB", err);
  }

  // 2. Fallback: Jika cookie/getSession gagal, cek Bearer token di Authorization header langsung ke DB
  if (!session?.user) {
    const authHeader = c.req.header("authorization") || c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace(/^Bearer\s+/i, "").trim();
      if (token) {
        try {
          const [sessRow] = await db
            .select()
            .from(sessions)
            .where(eq(sessions.token, token))
            .limit(1);

          if (sessRow && new Date(sessRow.expiresAt) > new Date()) {
            const [userRow] = await db
              .select()
              .from(users)
              .where(eq(users.id, sessRow.userId))
              .limit(1);

            if (userRow && userRow.statusAkun !== "NONAKTIF") {
              session = {
                user: userRow as any,
                session: sessRow as any,
              };
            }
          }
        } catch (dbErr) {
          logger.error("Gagal melakukan query fallback session token ke database", dbErr);
        }
      }
    }
  }

  if (!session?.user) {
    return gagal(c, "Sesi tidak valid. Silakan masuk kembali.", "UNAUTHORIZED", 401);
  }

  // Attach user & session ke context Hono
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
}

export async function adminMiddleware(c: Context, next: Next) {
  const user = c.get("user") as any;
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.peran)) {
    return gagal(c, "Akses ditolak. Hanya admin yang diizinkan.", "FORBIDDEN", 403);
  }
  await next();
}

declare module "hono" {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
      peran: string;
      namaLengkap?: string | null;
    };
    session: {
      id: string;
      userId: string;
      token: string;
    };
  }
}
