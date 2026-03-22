import { eq, and, isNull } from "drizzle-orm";
import type { PgSelect, PgColumn } from "drizzle-orm/pg-core";

/**
 * Adiciona filtro de org_id a uma query para isolamento multi-tenant.
 * Deve ser usado em TODA query que acessa dados multi-tenant.
 */
export function withOrgId<T extends PgSelect>(
  query: T,
  orgIdColumn: PgColumn,
  orgId: string
): T {
  return query.where(eq(orgIdColumn, orgId)) as T;
}

/**
 * Adiciona filtro de soft delete (deleted_at IS NULL) à query.
 */
export function withNotDeleted<T extends PgSelect>(
  query: T,
  deletedAtColumn: PgColumn
): T {
  return query.where(isNull(deletedAtColumn)) as T;
}

/**
 * Combina filtro de org_id + soft delete para queries multi-tenant.
 */
export function withOrgIdAndNotDeleted<T extends PgSelect>(
  query: T,
  orgIdColumn: PgColumn,
  deletedAtColumn: PgColumn,
  orgId: string
): T {
  return query.where(
    and(eq(orgIdColumn, orgId), isNull(deletedAtColumn))
  ) as T;
}

/**
 * Helper de paginação baseada em offset.
 */
export function paginate<T extends PgSelect>(
  query: T,
  page: number,
  pageSize: number
): T {
  return query.limit(pageSize).offset((page - 1) * pageSize) as T;
}
