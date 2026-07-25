import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "./env";

neonConfig.fetchFunction = globalThis.fetch;

const sql = neon(env.databaseUrl);
export const db = drizzle(sql);
export type Database = typeof db;
