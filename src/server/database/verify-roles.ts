import { db } from "../config/database";
import { users } from "./schema";
import { auth } from "../features/auth/auth.config";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🔒 Verifying and setting roles for dev accounts...");

  const devAccounts = [
    { email: "superadmin@brevetai.id", role: "SUPER_ADMIN" as const },
    { email: "admin@brevetai.id", role: "ADMIN" as const },
    { email: "student@brevetai.id", role: "STUDENT" as const },
  ];

  for (const acc of devAccounts) {
    await db
      .update(users)
      .set({ peran: acc.role, statusAkun: "AKTIF" })
      .where(eq(users.email, acc.email));
    console.log(`✅ Set ${acc.email} -> ${acc.role}`);
  }
}

main().catch(console.error);
