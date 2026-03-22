// WARNING: This client bypasses RLS. NEVER import in client components.
// Only use in Server Actions, API Routes, and server-side scripts.

import { createClient } from "@supabase/supabase-js";
import { getServiceRoleKey } from "@/lib/env";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getServiceRoleKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
