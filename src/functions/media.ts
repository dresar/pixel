import { createServerFn } from "@tanstack/react-start";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin } from "../server/shared/middleware/role-middleware";
import { db } from "../server/config/database";
import { mediaAssets } from "../server/database/schema";
import { cloudinary } from "../server/config/cloudinary";
import { eq, desc, ne } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

// Fetch all active media assets from Neon DB
export const getDaftarMediaAdmin = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await validasiSesi();
    const list = await db
      .select()
      .from(mediaAssets)
      .where(ne(mediaAssets.status, "DIHAPUS"))
      .orderBy(desc(mediaAssets.createdAt));

    return sukses("Daftar media dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Terjadi kesalahan mengambil data media.", "INTERNAL_ERROR");
  }
});

// Upload media asset directly to Cloudinary & save metadata in Neon DB
export const unggahMediaAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileBase64: z.string().min(1, "File tidak boleh kosong"),
      namaFile: z.string().min(1),
      namaTampilan: z.string().optional(),
      folder: z.string().optional().default("brevetai/cms"),
      entitasTipe: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      // Upload to Cloudinary using real credentials from .env
      const uploadRes = await cloudinary.uploader.upload(data.fileBase64, {
        folder: data.folder,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      });

      // Insert metadata into Neon PostgreSQL
      const [newMedia] = await db
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
          diunggahOleh: sesi.userId,
          status: "AKTIF",
        })
        .returning();

      return sukses(`Media "${newMedia.namaTampilan}" berhasil diunggah ke Cloudinary!`, newMedia);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      const errMessage = error instanceof Error ? error.message : String(error);
      return gagal(`Gagal mengunggah media ke Cloudinary: ${errMessage}`, "INTERNAL_ERROR");
    }
  });

// Delete media asset from Cloudinary & Neon DB
export const hapusMediaAdmin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      cloudinaryPublicId: z.string().min(1),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());

      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(data.cloudinaryPublicId);
      } catch (err) {
        console.warn("Gagal menghapus dari Cloudinary, melanjutkan hapus DB:", err);
      }

      // Delete row from Neon DB
      const [deleted] = await db.delete(mediaAssets).where(eq(mediaAssets.id, data.id)).returning();

      return sukses(`Media "${deleted?.namaTampilan || deleted?.namaFile || 'Media'}" berhasil dihapus permanen!`, deleted);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus media.", "INTERNAL_ERROR");
    }
  });
