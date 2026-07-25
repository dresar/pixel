import { createServerFn } from "@tanstack/react-start";
import { db } from "../server/config/database";
import { glossaryEntries } from "../server/database/schema";
import { ilike, or, asc, eq } from "drizzle-orm";
import { sukses, gagal } from "../server/shared/utils/response-builder";
import { isAppError } from "../server/shared/errors/AppError";
import { z } from "zod";

export const getGlosarium = createServerFn({ method: "GET" })
  .validator(z.object({ cari: z.string().optional() }))
  .handler(async ({ data }) => {
    try {
      let query = db.select().from(glossaryEntries).orderBy(asc(glossaryEntries.istilah)).$dynamic();
      if (data.cari) {
        query = query.where(
          or(
            ilike(glossaryEntries.istilah, `%${data.cari}%`),
            ilike(glossaryEntries.definisi, `%${data.cari}%`),
          ),
        );
      }
      const daftar = await query;
      return sukses("Data glosarium berhasil dimuat", daftar);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });

export const tambahGlosarium = createServerFn({ method: "POST" })
  .validator(
    z.object({
      istilah: z.string().min(2),
      slug: z.string().min(2),
      definisi: z.string().min(5),
      referensiUndangUndang: z.string().optional(),
      kategori: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    try {
      const [entry] = await db.insert(glossaryEntries).values(data).returning();
      return sukses("Istilah glosarium berhasil ditambahkan", entry);
    } catch (error) {
      if (isAppError(error)) return gagal(error.message, error.code);
      return gagal("Terjadi kesalahan sistem.", "INTERNAL_ERROR");
    }
  });
