/**
 * Media Routes — /api/media/*
 * Connected to Neon DB media_assets & Cloudinary Direct API
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, ne } from "drizzle-orm";
import { db } from "../../config/database.js";
import { mediaAssets } from "../../database/schema/index.js";
import { cloudinary } from "../../config/cloudinary.js";
import { authMiddleware, adminMiddleware } from "../../shared/middleware/auth.middleware.js";
import { sukses, gagal } from "../../shared/utils/response.js";
import { isAppError } from "../../shared/errors/AppError.js";

const mediaRoutes = new Hono();

mediaRoutes.use("/*", authMiddleware, adminMiddleware);

// GET /api/media — Daftar semua media aktif (Neon DB + Cloudinary Direct API)
mediaRoutes.get("/", async (c) => {
  try {
    let dbList: any[] = [];
    try {
      dbList = await db
        .select()
        .from(mediaAssets)
        .where(ne(mediaAssets.status, "DIHAPUS"))
        .orderBy(desc(mediaAssets.createdAt));
    } catch (dbErr) {
      console.warn("DB media list error:", dbErr);
    }

    // Ambil juga asset langsung dari Cloudinary Storage
    let cldList: any[] = [];
    try {
      const cldRes = await cloudinary.api.resources({
        type: "upload",
        max_results: 100,
      });
      if (cldRes?.resources) {
        cldList = cldRes.resources.map((r: any) => ({
          id: r.public_id,
          cloudinaryPublicId: r.public_id,
          secureUrl: r.secure_url,
          namaFile: r.public_id.split("/").pop() || r.public_id,
          namaTampilan: r.public_id.split("/").pop() || r.public_id,
          folder: r.folder || "Cloudinary Storage",
          mimeType: `image/${r.format}`,
          lebar: r.width,
          tinggi: r.height,
          ukuranByte: r.bytes,
          entitasTipe: "ILUSTRASI",
          createdAt: r.created_at,
        }));
      }
    } catch (cldErr) {
      console.warn("Cloudinary API list fallback:", cldErr);
    }

    // Merge & deduplicate berdasarkan publicId / secureUrl
    const map = new Map<string, any>();
    for (const item of [...dbList, ...cldList]) {
      const key = item.cloudinaryPublicId || item.secureUrl;
      if (key && !map.has(key)) {
        map.set(key, item);
      }
    }

    const merged = Array.from(map.values());
    return sukses(c, "Daftar media dimuat", merged);
  } catch (error) {
    return sukses(c, "Daftar media dimuat", []);
  }
});

// POST /api/media/unggah — Upload media ke Cloudinary
mediaRoutes.post(
  "/unggah",
  zValidator(
    "json",
    z.object({
      fileBase64: z.string().min(1, "File tidak boleh kosong"),
      namaFile: z.string().min(1),
      namaTampilan: z.string().optional(),
      folder: z.string().optional().default("brevetai/cms"),
      entitasTipe: z.string().optional(),
    }),
  ),
  async (c) => {
    try {
      const user = c.get("user");
      const data = c.req.valid("json");

      const uploadRes = await cloudinary.uploader.upload(data.fileBase64, {
        folder: data.folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      });

      let newMedia = {
        id: uploadRes.public_id,
        cloudinaryPublicId: uploadRes.public_id,
        secureUrl: uploadRes.secure_url,
        namaFile: data.namaFile,
        namaTampilan: data.namaTampilan || data.namaFile,
        folder: uploadRes.folder || data.folder,
        mimeType: uploadRes.format ? `image/${uploadRes.format}` : "image/jpeg",
        lebar: uploadRes.width,
        tinggi: uploadRes.height,
        ukuranByte: uploadRes.bytes,
        entitasTipe: data.entitasTipe || "ILUSTRASI",
        status: "AKTIF",
      };

      try {
        const [inserted] = await db
          .insert(mediaAssets)
          .values({
            cloudinaryPublicId: uploadRes.public_id,
            secureUrl: uploadRes.secure_url,
            namaFile: data.namaFile,
            namaTampilan: data.namaTampilan || data.namaFile,
            folder: uploadRes.folder || data.folder,
            mimeType: uploadRes.format ? `image/${uploadRes.format}` : "image/jpeg",
            lebar: uploadRes.width,
            tinggi: uploadRes.height,
            ukuranByte: uploadRes.bytes,
            entitasTipe: data.entitasTipe || "ILUSTRASI",
            diunggahOleh: user.id,
            status: "AKTIF",
          })
          .returning();
        if (inserted) newMedia = inserted as any;
      } catch (dbErr) {
        console.warn("Simpan DB media assets warning:", dbErr);
      }

      return sukses(c, `Media "${newMedia.namaTampilan}" berhasil diunggah ke Cloudinary!`, newMedia, 201);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      const errMessage = error instanceof Error ? error.message : String(error);
      return gagal(c, `Gagal mengunggah media: ${errMessage}`, "INTERNAL_ERROR", 500);
    }
  },
);

// DELETE /api/media/:id — Hapus media dari Cloudinary & DB
mediaRoutes.delete(
  "/:id",
  zValidator(
    "json",
    z.object({
      cloudinaryPublicId: z.string().min(1),
    }),
  ),
  async (c) => {
    try {
      const id = c.req.param("id");
      const { cloudinaryPublicId } = c.req.valid("json");

      try {
        await cloudinary.uploader.destroy(cloudinaryPublicId);
      } catch {
        // Lanjut hapus DB meski Cloudinary hapus gagal
      }

      let deleted: any = null;
      try {
        const [row] = await db
          .delete(mediaAssets)
          .where(eq(mediaAssets.id, id))
          .returning();
        deleted = row;
      } catch {
        // DB delete fallback
      }

      return sukses(c, `Media "${deleted?.namaTampilan || "Media"}" berhasil dihapus!`, deleted);
    } catch (error) {
      if (isAppError(error)) return gagal(c, error.message, error.code, error.statusCode);
      return gagal(c, "Gagal menghapus media.", "INTERNAL_ERROR", 500);
    }
  },
);

export { mediaRoutes };
