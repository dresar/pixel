/**
 * Studi Kasus Routes — Endpoint API Hono.js
 */

import { Hono } from "hono";
import {
  ambilSemuaStudiKasus,
  ambilStudiKasusBySlug,
  ambilStudiKasusById,
  tambahStudiKasus,
  updateStudiKasus,
  hapusStudiKasus,
} from "./studi-kasus.service.js";
import { sukses, gagal } from "../../shared/utils/response.js";

export const studiKasusRoutes = new Hono();

// ── GET /api/studi-kasus — Ambil daftar studi kasus ────────────────────────────
studiKasusRoutes.get("/", async (c) => {
  try {
    const list = await ambilSemuaStudiKasus();
    return sukses(c, "Berhasil mengambil daftar studi kasus", list);
  } catch (err: any) {
    return gagal(c, err.message || "Gagal mengambil studi kasus", "INTERNAL_ERROR", 500);
  }
});

// ── GET /api/studi-kasus/:slug — Detail studi kasus by slug or ID ────────────
studiKasusRoutes.get("/:slug", async (c) => {
  try {
    const slugOrId = c.req.param("slug");
    let detail = await ambilStudiKasusBySlug(slugOrId);
    if (!detail) {
      detail = await ambilStudiKasusById(slugOrId);
    }
    if (!detail) {
      return gagal(c, "Studi kasus tidak ditemukan", "NOT_FOUND", 404);
    }
    return sukses(c, "Berhasil mengambil detail studi kasus", detail);
  } catch (err: any) {
    return gagal(c, err.message || "Gagal mengambil detail studi kasus", "INTERNAL_ERROR", 500);
  }
});

// ── POST /api/studi-kasus/admin — Buat studi kasus baru (Admin) ────────────────
studiKasusRoutes.post("/admin", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.judul) {
      return gagal(c, "Judul studi kasus wajib diisi", "BAD_REQUEST", 400);
    }
    const baru = await tambahStudiKasus(body);
    return sukses(c, "Berhasil membuat studi kasus baru", baru, 201);
  } catch (err: any) {
    return gagal(c, err.message || "Gagal menambah studi kasus", "INTERNAL_ERROR", 500);
  }
});

// ── PATCH /api/studi-kasus/admin/:id — Update studi kasus (Admin) ─────────────
studiKasusRoutes.patch("/admin/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const updated = await updateStudiKasus(id, body);
    if (!updated) {
      return gagal(c, "Studi kasus tidak ditemukan", "NOT_FOUND", 404);
    }
    return sukses(c, "Berhasil memperbarui studi kasus", updated);
  } catch (err: any) {
    return gagal(c, err.message || "Gagal memperbarui studi kasus", "INTERNAL_ERROR", 500);
  }
});

// ── DELETE /api/studi-kasus/admin/:id — Hapus studi kasus (Admin) ────────────
studiKasusRoutes.delete("/admin/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await hapusStudiKasus(id);
    return sukses(c, "Berhasil menghapus studi kasus", { id });
  } catch (err: any) {
    return gagal(c, err.message || "Gagal menghapus studi kasus", "INTERNAL_ERROR", 500);
  }
});
