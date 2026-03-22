import type { Role } from "./roles";
import type { Action, Resource } from "./permissions";
import { PERMISSIONS } from "./permissions";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  orgId: string;
  name: string;
}

export function can(
  user: { role: Role },
  action: Action,
  resource: Resource
): boolean {
  const rolePermissions = PERMISSIONS[user.role];
  const resourceActions = rolePermissions[resource];
  if (!resourceActions) return false;
  return resourceActions.includes(action);
}

export function requireRole(userRole: Role, ...allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

export function requirePermission(
  user: { role: Role },
  action: Action,
  resource: Resource
): void {
  if (!can(user, action, resource)) {
    throw new Error(
      `Acesso negado: role '${user.role}' não tem permissão '${action}' em '${resource}'`
    );
  }
}
