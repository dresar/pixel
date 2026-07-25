import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { promptStudioService } from "../server/features/prompt-studio/prompt-studio.service";
import { validasiSesi } from "../server/shared/middleware/auth-middleware";
import { validasiPeran, membutuhkanAdmin } from "../server/shared/middleware/role-middleware";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";

// ── List all Prompt Engines (sorted by urutan_kompilasi)
export const getDaftarPromptEngine = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await validasiSesi();
    const list = await promptStudioService.daftarEngines();
    return sukses("Daftar Prompt Engine berhasil dimuat", list);
  } catch (error) {
    if (isAppError(error)) return gagal(error.message, error.code);
    return gagal("Gagal memuat daftar Prompt Engine.", "INTERNAL_ERROR");
  }
});

// ── Get single Prompt Engine by ID
export const getDetailPromptEngine = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const engine = await promptStudioService.detailEngine(data.id);
      return sukses("Detail Prompt Engine dimuat", engine);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memuat detail Prompt Engine.", "INTERNAL_ERROR");
    }
  });

// ── Create new Prompt Engine
export const buatPromptEngine = createServerFn({ method: "POST" })
  .validator(
    z.object({
      nama: z.string().min(1),
      kodeEngine: z.string().min(1).toUpperCase(),
      kategoriEngine: z.string().min(1),
      deskripsi: z.string().optional(),
      kontenTemplate: z.string().min(1),
      urutanKompilasi: z.number().int().min(0).default(99),
      aktif: z.boolean().default(true),
      tag: z.array(z.string()).optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const engine = await promptStudioService.buatEngine({
        ...data,
        dibuatOleh: sesi.userId,
      });
      return sukses("Prompt Engine berhasil dibuat", engine);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal membuat Prompt Engine.", "INTERNAL_ERROR");
    }
  });

// ── Update Prompt Engine (auto-version snapshot)
export const updatePromptEngine = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      nama: z.string().min(1).optional(),
      deskripsi: z.string().optional(),
      kontenTemplate: z.string().optional(),
      urutanKompilasi: z.number().int().min(0).optional(),
      aktif: z.boolean().optional(),
      tag: z.array(z.string()).optional(),
      catatanRevisi: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const { id, catatanRevisi, ...updateData } = data;
      const updated = await promptStudioService.updateEngine(id, updateData, sesi.userId, catatanRevisi);
      return sukses("Prompt Engine berhasil diperbarui", updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memperbarui Prompt Engine.", "INTERNAL_ERROR");
    }
  });

// ── Toggle aktif/nonaktif Prompt Engine
export const toggleAktifPromptEngine = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const updated = await promptStudioService.toggleAktif(data.id);
      return sukses(`Prompt Engine ${updated?.aktif ? "diaktifkan" : "dinonaktifkan"}`, updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal mengubah status Prompt Engine.", "INTERNAL_ERROR");
    }
  });

// ── Delete Prompt Engine
export const hapusPromptEngine = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      await promptStudioService.hapusEngine(data.id);
      return sukses("Prompt Engine berhasil dihapus", null);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal menghapus Prompt Engine.", "INTERNAL_ERROR");
    }
  });

// ── Get version history for a Prompt Engine
export const getRiwayatVersiEngine = createServerFn({ method: "GET" })
  .validator(z.object({ engineId: z.string().uuid() }))
  .handler(async ({ data }) => {
    try {
      await validasiSesi();
      const versi = await promptStudioService.daftarVersiEngine(data.engineId);
      return sukses("Riwayat versi dimuat", versi);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memuat riwayat versi.", "INTERNAL_ERROR");
    }
  });

// ── Restore a previous version
export const pulihkanVersiEngine = createServerFn({ method: "POST" })
  .validator(z.object({ engineId: z.string().uuid(), nomorVersi: z.number().int().min(1) }))
  .handler(async ({ data }) => {
    try {
      const sesi = await validasiSesi();
      await validasiPeran(sesi.userId, membutuhkanAdmin());
      const updated = await promptStudioService.pulihkanVersi(data.engineId, data.nomorVersi, sesi.userId);
      return sukses(`Engine dipulihkan ke Versi ${data.nomorVersi}`, updated);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Gagal memulihkan versi.", "INTERNAL_ERROR");
    }
  });
