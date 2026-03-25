import type { Role } from "@/lib/auth/roles";
import { cookies } from "next/headers";
import { DEMO_USER, DEMO_ORG, DEMO_ROLE } from "@/lib/demo-data";

export interface Context {
  user: { id: string; email: string } | null;
  orgId: string | null;
  role: Role | null;
  isDemo: boolean;
}

export async function createContext(): Promise<Context> {
  // Check for demo mode first
  try {
    const cookieStore = await cookies();
    const demoSession = cookieStore.get("demo-session");
    if (demoSession?.value === "true") {
      return {
        user: DEMO_USER,
        orgId: DEMO_ORG,
        role: DEMO_ROLE,
        isDemo: true,
      };
    }
  } catch {
    // cookies() may fail in some contexts
  }

  // Regular Supabase auth
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { user: null, orgId: null, role: null, isDemo: false };
    }

    const orgId = (user.user_metadata?.org_id as string) ?? null;
    const role = (user.user_metadata?.role as Role) ?? null;

    return {
      user: { id: user.id, email: user.email! },
      orgId,
      role,
      isDemo: false,
    };
  } catch {
    return { user: null, orgId: null, role: null, isDemo: false };
  }
}
