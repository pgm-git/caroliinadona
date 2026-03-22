import type { Role } from "@/lib/auth/roles";

export interface Context {
  user: { id: string; email: string } | null;
  orgId: string | null;
  role: Role | null;
}

export async function createContext(): Promise<Context> {
  // In the API handler, we dynamically import supabase server client
  // to read the user from session cookies
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, orgId: null, role: null };
    }

    // Extract org and role from user metadata
    // These would be populated by a Supabase trigger on auth.users
    const orgId = (user.user_metadata?.org_id as string) ?? null;
    const role = (user.user_metadata?.role as Role) ?? null;

    return {
      user: { id: user.id, email: user.email! },
      orgId,
      role,
    };
  } catch {
    return { user: null, orgId: null, role: null };
  }
}
