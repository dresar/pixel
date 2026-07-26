/**
 * Better-Auth Client — terhubung ke API backend
 */

import { createAuthClient } from "better-auth/react";

const API_URL = (import.meta as any).env?.VITE_API_URL || (typeof window !== "undefined" ? window.location.origin : "");

export const authClient = createAuthClient({
  baseURL: API_URL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
