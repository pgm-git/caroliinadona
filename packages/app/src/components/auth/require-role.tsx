"use client";

import type { Role } from "@/lib/auth/roles";

interface RequireRoleProps {
  userRole: Role;
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({
  userRole,
  allowedRoles,
  children,
  fallback = null,
}: RequireRoleProps) {
  if (!allowedRoles.includes(userRole)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
