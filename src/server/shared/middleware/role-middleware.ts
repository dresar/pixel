import { db } from "../../config/database";
import { users } from "../../database/schema";
import { eq } from "drizzle-orm";
import { AuthorizationError } from "../errors/AppError";
import { logger } from "../logger/logger";
import type { User } from "../../database/schema";

type Peran = "STUDENT" | "ADMIN" | "SUPER_ADMIN";

const HIERARKI_PERAN: Record<Peran, number> = {
  STUDENT: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
};

export async function validasiPeran(authUserId: string, peranMinimum: Peran): Promise<User> {
  const [pengguna] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUserId))
    .limit(1);

  if (!pengguna) {
    throw new AuthorizationError("Profil pengguna tidak ditemukan.");
  }

  if (pengguna.statusAkun !== "AKTIF") {
    logger.security("Akses ditolak: akun tidak aktif", { authUserId, status: pengguna.statusAkun });
    throw new AuthorizationError("Akun Anda tidak aktif. Hubungi administrator.");
  }

  const levelPengguna = HIERARKI_PERAN[pengguna.peran as Peran] ?? 0;
  const levelDibutuhkan = HIERARKI_PERAN[peranMinimum];

  if (levelPengguna < levelDibutuhkan) {
    logger.security("Akses ditolak: peran tidak mencukupi", {
      authUserId,
      peranPengguna: pengguna.peran,
      peranDibutuhkan: peranMinimum,
    });
    throw new AuthorizationError();
  }

  return pengguna;
}

export function membutuhkanAdmin(): Peran {
  return "ADMIN";
}

export function membutuhkanSuperAdmin(): Peran {
  return "SUPER_ADMIN";
}

export function membutuhkanStudent(): Peran {
  return "STUDENT";
}
