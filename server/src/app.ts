/**
 * BrevetAI Backend Server — Entry Point
 * Framework: Hono.js (ultra-ringan, TypeScript-native)
 * Deploy: cPanel Node.js App → node app.js
 */

import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as honoLogger } from "hono/logger";
import { serve } from "@hono/node-server";

import { env } from "./config/env.js";
import { logger } from "./shared/utils/logger.js";
import { gagal } from "./shared/utils/response.js";

// ── Feature Routes ─────────────────────────────────────────────────────────────
import { authRoutes } from "./features/auth/auth.routes.js";
import { modulesRoutes } from "./features/modules/modules.routes.js";
import { aiRoutes } from "./features/ai-engine/ai.routes.js";
import { usersRoutes } from "./features/users/users.routes.js";
import { mediaRoutes } from "./features/media/media.routes.js";
import { glossaryRoutes } from "./features/glossary/glossary.routes.js";
import { referensiRoutes } from "./features/referensi/referensi.routes.js";
import { notificationsRoutes } from "./features/notifications/notifications.routes.js";
import { quizRoutes } from "./features/quiz/quiz.routes.js";
import { apiKeysRoutes } from "./features/api-keys/api-keys.routes.js";
import { promptStudioRoutes } from "./features/prompt-studio/prompt-studio.routes.js";
import { studiKasusRoutes } from "./features/studi-kasus/studi-kasus.routes.js";

// ── App Instance ───────────────────────────────────────────────────────────────
const app = new Hono();

// ── Global Middleware ──────────────────────────────────────────────────────────

// Request logger (development only)
if (env.NODE_ENV === "development") {
  app.use("*", honoLogger());
}

// CORS — izinkan frontend mengakses API
app.use(
  "*",
  cors({
    origin: [env.FRONTEND_URL, env.BASE_URL, "http://localhost:3000", "http://localhost:5173"],
    allowHeaders: ["Content-Type", "Authorization", "Cookie"],
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Set-Cookie"],
    credentials: true,
    maxAge: 86400,
  }),
);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/", (c) =>
  c.json({
    nama: "BrevetAI Backend API",
    versi: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString(),
    dokumentasi: `${env.BASE_URL}/api/health`,
  }),
);

app.get("/api/health", (c) =>
  c.json({
    sukses: true,
    status: "sehat",
    layanan: {
      database: "Neon PostgreSQL",
      ai: "Google Gemini",
      storage: "Cloudinary",
      auth: "Better-Auth",
    },
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  }),
);

// ── API Routes ─────────────────────────────────────────────────────────────────
app.route("/api/auth", authRoutes);
app.route("/auth", authRoutes);

app.route("/api/ai", aiRoutes);
app.route("/ai", aiRoutes);

app.route("/api/users", usersRoutes);
app.route("/users", usersRoutes);

app.route("/api/media", mediaRoutes);
app.route("/media", mediaRoutes);

app.route("/api/glosarium", glossaryRoutes);
app.route("/glosarium", glossaryRoutes);

app.route("/api/referensi", referensiRoutes);
app.route("/referensi", referensiRoutes);

app.route("/api/notifikasi", notificationsRoutes);
app.route("/notifikasi", notificationsRoutes);

app.route("/api/kuis", quizRoutes);
app.route("/kuis", quizRoutes);

app.route("/api/api-keys", apiKeysRoutes);
app.route("/api-keys", apiKeysRoutes);

app.route("/api/prompt-studio", promptStudioRoutes);
app.route("/prompt-studio", promptStudioRoutes);

app.route("/api/studi-kasus", studiKasusRoutes);
app.route("/studi-kasus", studiKasusRoutes);

app.route("/api", modulesRoutes);         // /api/roadmap, /api/materi, /api/modules
app.route("/", modulesRoutes);

// ── 404 Handler ────────────────────────────────────────────────────────────────
app.notFound((c) => gagal(c, `Endpoint ${c.req.path} tidak ditemukan`, "NOT_FOUND", 404));

// ── Global Error Handler ───────────────────────────────────────────────────────
app.onError((err, c) => {
  logger.error("Unhandled server error", err);
  return gagal(c, "Terjadi kesalahan server yang tidak terduga", "INTERNAL_ERROR", 500);
});

// ── Start Server ───────────────────────────────────────────────────────────────
const port = env.PORT;

if (!process.env.VERCEL) {
  serve({ fetch: app.fetch, port }, () => {
    logger.info(`🚀 BrevetAI Backend berjalan di port ${port}`);
    logger.info(`   Environment : ${env.NODE_ENV}`);
    logger.info(`   Health Check: http://localhost:${port}/api/health`);
    logger.info(`   Auth API    : http://localhost:${port}/api/auth`);
    logger.info(`   Frontend URL: ${env.FRONTEND_URL}`);
    if (env.NODE_ENV === "development") {
      logger.info(`\n📋 Route Summary:`);
      logger.info(`   GET  /api/health`);
      logger.info(`   ALL  /api/auth/*          — Better-Auth`);
      logger.info(`   GET  /api/roadmap         — Roadmap publik`);
      logger.info(`   GET  /api/studi-kasus     — Studi Kasus publik & admin`);
    }
  });
}

export { app };
export default app;
