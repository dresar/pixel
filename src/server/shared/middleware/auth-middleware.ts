import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "../../features/auth/auth.config";
import { AuthenticationError } from "../errors/AppError";
import { logger } from "../logger/logger";

export type AuthenticatedUser = {
  sessionId: string;
  userId: string;
  email: string;
};

export async function validasiSesi(): Promise<AuthenticatedUser> {
  const headers = getRequestHeaders();
  const sesi = await auth.api.getSession({ headers });

  if (!sesi?.session || !sesi?.user) {
    logger.auth("Akses ditolak: sesi tidak valid");
    throw new AuthenticationError();
  }

  return {
    sessionId: sesi.session.id,
    userId: sesi.user.id,
    email: sesi.user.email,
  };
}
