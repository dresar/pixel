import { db } from "../config/database";
import { roadmaps, levels, modules, chapters, lessons } from "./schema";
import { eq } from "drizzle-orm";

async function seedModules() {
  console.log("🌱 Seeding Brevet Pajak Educational Modules & Lessons into Neon DB...");

  let [rm] = await db.select().from(roadmaps).limit(1);
  if (!rm) {
    [rm] = await db
      .insert(roadmaps)
      .values({
        judul: "Roadmap Utama Brevet Pajak A & B",
        slug: "roadmap-brevet-ab",
        deskripsi: "Kurikulum resmi pelatihan Brevet Pajak.",
      })
      .returning();
  }

  let [level] = await db.select().from(levels).limit(1);
  if (!level) {
    [level] = await db
      .insert(levels)
      .values({
        roadmapId: rm.id,
        kodeLevel: "BREVET_A",
        judul: "Brevet Pajak A",
        deskripsi: "Tingkat dasar perpajakan Orang Pribadi.",
        urutan: 1,
      })
      .returning();
  }

  // Check or Insert Module 1
  let [modul1] = await db.select().from(modules).where(eq(modules.slug, "pph-orang-pribadi"));
  if (!modul1) {
    [modul1] = await db
      .insert(modules)
      .values({
        levelId: level.id,
        judul: "PPh Orang Pribadi (UU HPP & Tarif Progresif)",
        slug: "pph-orang-pribadi",
        deskripsi: "Panduan komprehensif penghitungan Pajak Penghasilan Orang Pribadi, PTKP, dan lapisan tarif Pasal 17 UU HPP.",
        statusPublikasi: "TERBIT",
        tingkatKesulitan: "DASAR",
        estimasiMenit: 45,
      })
      .returning();
  }

  let [chap1] = await db.select().from(chapters).where(eq(chapters.moduleId, modul1.id));
  if (!chap1) {
    [chap1] = await db
      .insert(chapters)
      .values({
        moduleId: modul1.id,
        judul: "Bab 1: Konsep Dasar & Tarif PPh Pasal 17 OP",
        urutan: 1,
      })
      .returning();
  }

  let [less1] = await db.select().from(lessons).where(eq(lessons.slug, "tarif-pph-pasal-17-op"));
  if (!less1) {
    await db.insert(lessons).values({
      chapterId: chap1.id,
      judul: "Tarif PPh Pasal 17 untuk Wajib Pajak Orang Pribadi",
      slug: "tarif-pph-pasal-17-op",
      urutan: 1,
      statusPublikasi: "TERBIT",
      estimasiMenit: 15,
      kontenJson: {
        pengantar: "Pasal 17 UU PPh jo. UU HPP mengatur tarif progresif PPh Orang Pribadi Dalam Negeri.",
      },
    });
  }

  console.log("🎉 Educational Modules and Lessons checked and ready in Neon DB!");
}

seedModules().catch(console.error);
