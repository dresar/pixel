/**
 * Modules Routes — /api/modules/*  /api/roadmap/*  /api/materi/*
 * Public read access for curriculum materials & modules
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { modulesService } from "./modules.service.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal, terpaginasi } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";
import { logger } from "../../shared/utils/logger.js";

const modulesRoutes = new Hono();

// ── Public Routes (Dapat Dibaca Bebas Tanpa Hambatan 401) ──────────────────────

// GET /api/roadmap — Roadmap yang diterbitkan
modulesRoutes.get("/roadmap", async (c) => {
  try {
    const data = await modulesService.ambilRoadmap();
    return sukses(c, "Roadmap berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal memuat roadmap", error);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/roadmap/realtime — Data realtime roadmap + stats
modulesRoutes.get("/roadmap/realtime", async (c) => {
  try {
    const data = await modulesService.ambilRealtimeRoadmap();
    return sukses(c, "Data realtime roadmap berhasil dimuat!", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal memuat realtime roadmap", error);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/materi — Daftar materi untuk siswa (Publik)
modulesRoutes.get("/materi", async (c) => {
  try {
    const data = await modulesService.daftarMateriSiswa();
    return sukses(c, "Data materi siswa berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal memuat materi siswa", error);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/materi/:slug — Konten pelajaran by slug (Publik)
modulesRoutes.get("/materi/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const data = await modulesService.kontenPelajaran(slug);
    return sukses(c, "Konten pelajaran berhasil dimuat", data);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    logger.error("Gagal memuat konten pelajaran", error);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// GET /api/modules — Daftar modul (Publik)
modulesRoutes.get(
  "/modules",
  zValidator(
    "query",
    z.object({
      levelId: z.string().optional(),
      status: z.enum(["DRAFT", "REVIEW", "DISETUJUI", "TERBIT", "ARSIP"]).optional(),
      cari: z.string().optional(),
      halaman: z.coerce.number().int().min(1).default(1),
      per_halaman: z.coerce.number().int().min(1).max(50).default(20),
    }),
  ),
  async (c) => {
    try {
      const filter = c.req.valid("query");
      const result = await modulesService.daftarModul(filter);
      return terpaginasi(c, "Daftar modul berhasil dimuat", result.data, result.meta);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      logger.error("Gagal memuat daftar modul", error);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

// GET /api/modules/:slug — Detail modul (Publik)
modulesRoutes.get("/modules/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const modul = await modulesService.detailModulBySlug(slug);
    return sukses(c, "Detail modul berhasil dimuat", modul);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// ── Admin Routes (Operasi Perubahan Memerlukan Auth & Role Admin) ──────────────
modulesRoutes.use("/admin/*", authMiddleware, adminMiddleware);

// POST /api/admin/modules — Buat modul baru
modulesRoutes.post(
  "/admin/modules",
  zValidator(
    "json",
    z.object({
      levelId: z.string().uuid("Level ID tidak valid"),
      judul: z.string().min(3, "Judul minimal 3 karakter").max(255),
      deskripsi: z.string().optional(),
      tingkatKesulitan: z.enum(["DASAR", "MENENGAH", "LANJUT"]).default("DASAR"),
      estimasiMenit: z.number().int().min(0).default(0),
      urutan: z.number().int().min(0).default(0),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");
      const modul = await modulesService.buatModul(data, user.id);
      return sukses(c, "Modul baru berhasil dibuat", modul, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      logger.error("Gagal membuat modul", error);
      return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
    }
  },
);

// POST /api/admin/modules/:id/terbitkan — Terbitkan modul
modulesRoutes.post("/admin/modules/:id/terbitkan", async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");
    const modul = await modulesService.terbitkanModul(id, user.id);
    return sukses(c, "Modul berhasil diterbitkan", modul);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// DELETE /api/admin/modules/:id — Hapus modul (soft delete)
modulesRoutes.delete("/admin/modules/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await modulesService.hapusModul(id);
    return sukses(c, "Modul beserta bab dan materinya berhasil dihapus", null);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Terjadi kesalahan sistem.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/admin/materi/:id/prompt-gambar — Generate prompt gambar AI
modulesRoutes.post("/admin/materi/:id/prompt-gambar", async (c) => {
  try {
    const id = c.req.param("id");
    const result = await modulesService.generatePromptGambar(id);
    return sukses(c, "Super Prompt Gambar AI berhasil dibuat!", result);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal membuat prompt gambar AI.", "INTERNAL_ERROR", 500);
  }
});

// POST /api/admin/chapters — Tambah Bab Baru
modulesRoutes.post(
  "/admin/chapters",
  zValidator(
    "json",
    z.object({
      moduleId: z.string().min(1),
      judul: z.string().min(1),
      deskripsi: z.string().optional(),
      urutan: z.number().optional(),
    }),
  ),
  async (c) => {
    try {
      const data = c.req.valid("json");
      const chap = await modulesService.tambahChapter(data);
      return sukses(c, "Bab baru berhasil dibuat!", chap, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal membuat bab baru.", "INTERNAL_ERROR", 500);
    }
  },
);

// PATCH /api/admin/chapters/:id — Update Bab
modulesRoutes.patch(
  "/admin/chapters/:id",
  zValidator(
    "json",
    z.object({
      judul: z.string().optional(),
      deskripsi: z.string().optional(),
      urutan: z.number().optional(),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");
      const chap = await modulesService.updateChapter(id, data);
      return sukses(c, "Bab berhasil diperbarui!", chap);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal memperbarui bab.", "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/admin/chapters/:id — Hapus Bab
modulesRoutes.delete("/admin/chapters/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await modulesService.hapusChapter(id);
    return sukses(c, "Bab berhasil dihapus!", null);
  } catch (error) {
    if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
    return gagal(c, "Gagal menghapus bab.", "INTERNAL_ERROR", 500);
  }
});

// PATCH /api/admin/materi/:id — Update Materi (Lesson)
modulesRoutes.patch(
  "/admin/materi/:id",
  zValidator(
    "json",
    z.object({
      judul: z.string().optional(),
      gambarUrl: z.string().optional(),
      promptGambar: z.string().optional(),
      statusPublikasi: z.string().optional(),
      kontenJson: z.unknown().optional(),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");
      const lesson = await modulesService.updateLesson(id, data);
      return sukses(c, "Materi berhasil diperbarui!", lesson);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal memperbarui materi.", "INTERNAL_ERROR", 500);
    }
  },
);

export { modulesRoutes };
