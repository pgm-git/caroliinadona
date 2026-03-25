import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl } from "@/lib/env";
import * as schema from "./schema";
import * as relations from "./relations";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function initializeDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const connectionString = getDatabaseUrl();
  const client = postgres(connectionString, {
    prepare: false, // Supabase Transaction Mode requer prepare: false
  });

  dbInstance = drizzle(client, {
    schema: { ...schema, ...relations },
  });

  return dbInstance;
}

export const db = new Proxy(
  {},
  {
    get: (target, prop) => {
      const instance = initializeDb();
      return (instance as any)[prop];
    },
  }
) as ReturnType<typeof drizzle>;

export type Database = ReturnType<typeof drizzle>;
