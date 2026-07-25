import { db } from "../config/database";
import { users, accounts } from "./schema";
import { auth } from "../features/auth/auth.config";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🔐 Seeding Better Auth accounts for dev users...");

  // Reset existing accounts table to start fresh
  await db.delete(accounts);
  await db.delete(users);

  const devAccounts = [
    {
      name: "Super Admin BrevetAI",
      email: "superadmin@brevetai.id",
      password: "Password123!",
      role: "SUPER_ADMIN" as const,
    },
    {
      name: "Admin Konten Pajak",
      email: "admin@brevetai.id",
      password: "Password123!",
      role: "ADMIN" as const,
    },
    {
      name: "Siswa Brevet Uji Coba",
      email: "student@brevetai.id",
      password: "Password123!",
      role: "STUDENT" as const,
    },
  ];

  for (const acc of devAccounts) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: acc.name,
          email: acc.email,
          password: acc.password,
        },
      });

      if (res?.user?.id) {
        await db
          .update(users)
          .set({ peran: acc.role, statusAkun: "AKTIF" })
          .where(eq(users.id, res.user.id));
        console.log(`✅ Successfully created & verified account: ${acc.email} (${acc.role})`);
      }
    } catch (e) {
      console.log(`ℹ️ Result for ${acc.email}:`, e instanceof Error ? e.message : String(e));
    }
  }

  console.log("🎉 Better Auth seeding completed!");
}

main().catch(console.error);
