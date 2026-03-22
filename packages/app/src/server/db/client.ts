import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/env";
import * as schema from "./schema";
import * as relations from "./relations";

const connectionString = getDatabaseUrl();

const client = postgres(connectionString, {
  prepare: false, // Supabase Transaction Mode requer prepare: false
});

export const db = drizzle(client, {
  schema: { ...schema, ...relations },
});

export type Database = typeof db;
