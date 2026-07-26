import { db } from "../config/database";
import { sql } from "drizzle-orm";

async function runDdl() {
  console.log("⚡ Executing database DDL updates...");

  await db.execute(sql`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS slug text;`);
  await db.execute(sql`UPDATE quizzes SET slug = COALESCE(slug, 'kuis-' || id) WHERE slug IS NULL;`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS referensi_hukum (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      nomor_peraturan text NOT NULL,
      slug text UNIQUE NOT NULL,
      judul text NOT NULL,
      kategori text NOT NULL DEFAULT 'UU',
      tahun text,
      ringkasan text NOT NULL,
      konten_lengkap text,
      url_dokumen text,
      status text NOT NULL DEFAULT 'AKTIF',
      created_by text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    );
  `);

  console.log("✅ Referensi Hukum table created & Quizzes slug updated!");
  process.exit(0);
}

runDdl();
