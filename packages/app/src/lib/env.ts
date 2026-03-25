function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabase: {
    url: getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  },
} as const;

export function getServiceRoleKey(): string {
  return getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getDatabaseUrl(): string {
  // Tenta usar SUPABASE_DB_URL se disponível, senão deriva da URL pública
  const explicit = process.env.SUPABASE_DB_URL;
  if (explicit) {
    return explicit;
  }

  // Fallback: gera URL do banco a partir da URL pública
  // https://xxxxx.supabase.co → postgres://postgres:password@db.xxxxx.supabase.co:5432/postgres
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!supabaseUrl || !password) {
    throw new Error(
      "Must provide either SUPABASE_DB_URL or both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_DB_PASSWORD"
    );
  }

  const projectRef = supabaseUrl.split("https://")[1]?.split(".")[0];
  if (!projectRef) {
    throw new Error("Invalid NEXT_PUBLIC_SUPABASE_URL format");
  }

  return `postgres://postgres:${password}@db.${projectRef}.supabase.co:5432/postgres`;
}
