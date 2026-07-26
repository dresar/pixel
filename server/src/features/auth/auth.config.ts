/**
 * Better-Auth Configuration — Sesuai Origin Frontend
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../../config/database.js";
import { env } from "../../config/env.js";
import { users, accounts, sessions, verifications } from "../../database/schema/index.js";

export const auth = betterAuth({
  baseURL: env.BASE_URL || "http://localhost:3001",
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      account: accounts,
      session: sessions,
      verification: verifications,
    },
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "https://pixel-ivory-one.vercel.app",
    env.FRONTEND_URL,
    env.BASE_URL,
  ],

  user: {
    additionalFields: {
      peran: {
        type: "string",
        defaultValue: "STUDENT",
      },
      namaLengkap: {
        type: "string",
        required: false,
      },
      statusAkun: {
        type: "string",
        defaultValue: "AKTIF",
      },
    },
  },
});
