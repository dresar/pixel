import { promptStudioRepository } from "./prompt-studio.repository";
import type { NewPromptEngine } from "../../database/schema";
import { NotFoundError, ConflictError } from "../../shared/errors/AppError";

export const promptStudioService = {
  async daftarEngines() {
    return promptStudioRepository.daftarEngines();
  },

  async detailEngine(id: string) {
    const engine = await promptStudioRepository.ambilEngineById(id);
    if (!engine) throw new NotFoundError("Engine tidak ditemukan.");
    return engine;
  },

  async buatEngine(data: Omit<NewPromptEngine, "id" | "createdAt" | "updatedAt">) {
    const existing = await promptStudioRepository.ambilEngineByKode(data.kodeEngine!);
    if (existing) throw new ConflictError(`Kode engine "${data.kodeEngine}" sudah digunakan.`);
    return promptStudioRepository.buatEngine(data as NewPromptEngine);
  },

  async updateEngine(
    id: string,
    data: Partial<Omit<NewPromptEngine, "id" | "createdAt" | "updatedAt">>,
    userId?: string | null,
    catatanRevisi?: string
  ) {
    const existing = await promptStudioRepository.ambilEngineById(id);
    if (!existing) throw new NotFoundError("Engine tidak ditemukan.");

    // Simpan snapshot versi lama sebelum update
    if (data.kontenTemplate && data.kontenTemplate !== existing.kontenTemplate) {
      await promptStudioRepository.simpanVersi({
        engineId: id,
        nomorVersi: existing.versi,
        kontenTemplate: existing.kontenTemplate,
        catatanRevisi: catatanRevisi || `Versi ${existing.versi} sebelum update`,
        dibuatOleh: userId ?? null,
      });

      data.versi = existing.versi + 1;
    }

    return promptStudioRepository.updateEngine(id, data);
  },

  async toggleAktif(id: string) {
    const existing = await promptStudioRepository.ambilEngineById(id);
    if (!existing) throw new NotFoundError("Engine tidak ditemukan.");
    return promptStudioRepository.updateEngine(id, { aktif: !existing.aktif });
  },

  async hapusEngine(id: string) {
    const existing = await promptStudioRepository.ambilEngineById(id);
    if (!existing) throw new NotFoundError("Engine tidak ditemukan.");
    await promptStudioRepository.hapusEngine(id);
  },

  async daftarVersiEngine(engineId: string) {
    return promptStudioRepository.daftarVersiEngine(engineId);
  },

  async pulihkanVersi(engineId: string, nomorVersi: number, userId?: string | null) {
    const versi = await promptStudioRepository.daftarVersiEngine(engineId);
    const target = versi.find((v) => v.nomorVersi === nomorVersi);
    if (!target) throw new NotFoundError(`Versi ${nomorVersi} tidak ditemukan.`);

    return this.updateEngine(
      engineId,
      { kontenTemplate: target.kontenTemplate },
      userId,
      `Dipulihkan dari Versi ${nomorVersi}`
    );
  },
};
