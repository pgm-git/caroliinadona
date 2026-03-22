import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../trpc";
import type { Role } from "@/lib/auth/roles";
import type { Action, Resource } from "@/lib/auth/permissions";
import { can } from "@/lib/auth/rbac";

export function requireRole(...roles: Role[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!roles.includes(ctx.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Acesso restrito aos papéis: ${roles.join(", ")}`,
      });
    }
    return next({ ctx });
  });
}

export function requirePermission(action: Action, resource: Resource) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!can({ role: ctx.role }, action, resource)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Sem permissão para ${action} em ${resource}`,
      });
    }
    return next({ ctx });
  });
}
