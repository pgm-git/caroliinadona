import { db } from "@/server/db/client";
import { exceptions, cases as casesTable, users, auditLog } from "@/server/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export type ExceptionType =
  | "missing_signature"
  | "incomplete_data"
  | "atypical_action"
  | "invalid_document"
  | "expired_statute"
  | "insufficient_guarantee"
  | "duplicate_case"
  | "jurisdiction_conflict"
  | "calculation_error"
  | "missing_document"
  | "data_inconsistency"
  | "other";

export type ExceptionSeverity = "low" | "medium" | "high" | "critical";
export type ExceptionStatus = "open" | "in_review" | "resolved" | "dismissed";

export interface CreateExceptionInput {
  orgId: string;
  caseId: string;
  exceptionType: ExceptionType;
  severity: ExceptionSeverity;
  title: string;
  description: string;
  affectedField?: string;
  suggestedAction?: string;
  blocksPipeline?: boolean;
  pipelineStep?: string;
  createdBy: string;
}

export interface ResolveExceptionInput {
  exceptionId: string;
  resolution: string;
  resolutionAction?: string;
  resolvedBy: string;
}

/**
 * Service for managing exceptions
 */
export const exceptionsService = {
  /**
   * Create a new exception
   */
  async create(input: CreateExceptionInput) {
    const [exception] = await db
      .insert(exceptions)
      .values({
        orgId: input.orgId,
        caseId: input.caseId,
        exceptionType: input.exceptionType as any,
        severity: input.severity as any,
        title: input.title,
        description: input.description,
        affectedField: input.affectedField,
        suggestedAction: input.suggestedAction,
        autoResolvable: false,
        blocksPipeline: input.blocksPipeline ?? true,
        pipelineStep: input.pipelineStep,
      })
      .returning();

    // Log exception creation
    await db.insert(auditLog).values({
      orgId: input.orgId,
      action: "INSERT",
      tableName: "exceptions",
      recordId: exception.id,
      userId: input.createdBy,
      description: `Exception created: ${input.title}`,
    });

    return exception;
  },

  /**
   * Get all open exceptions for an organization
   */
  async getOpenExceptions(orgId: string, limit = 20, offset = 0) {
    const items = await db
      .select()
      .from(exceptions)
      .where(
        and(
          eq(exceptions.orgId, orgId),
          eq(exceptions.status, "open")
        )
      )
      .orderBy(desc(exceptions.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ value: total }] = await db
      .select({ value: count() })
      .from(exceptions)
      .where(
        and(
          eq(exceptions.orgId, orgId),
          eq(exceptions.status, "open")
        )
      );

    return { items, total, limit, offset };
  },

  /**
   * Get all exceptions for a case
   */
  async getCaseExceptions(caseId: string) {
    return db
      .select()
      .from(exceptions)
      .where(eq(exceptions.caseId, caseId))
      .orderBy(desc(exceptions.createdAt));
  },

  /**
   * Get exception by ID
   */
  async getById(exceptionId: string, orgId: string) {
    const [exception] = await db
      .select()
      .from(exceptions)
      .where(
        and(
          eq(exceptions.id, exceptionId),
          eq(exceptions.orgId, orgId)
        )
      );

    return exception;
  },

  /**
   * Resolve an exception
   */
  async resolve(input: ResolveExceptionInput, orgId: string) {
    const [updated] = await db
      .update(exceptions)
      .set({
        status: "resolved" as any,
        resolvedAt: new Date(),
        resolutionNotes: input.resolution,
        resolutionAction: input.resolutionAction,
        resolvedBy: input.resolvedBy,
      })
      .where(
        and(
          eq(exceptions.id, input.exceptionId),
          eq(exceptions.orgId, orgId)
        )
      )
      .returning();

    if (updated) {
      await db.insert(auditLog).values({
        orgId,
        action: "UPDATE",
        tableName: "exceptions",
        recordId: input.exceptionId,
        userId: input.resolvedBy,
        description: `Exception resolved: ${input.resolution}`,
      });
    }

    return updated;
  },

  /**
   * Dismiss an exception
   */
  async dismiss(exceptionId: string, orgId: string, dismissedBy: string) {
    const [updated] = await db
      .update(exceptions)
      .set({
        status: "dismissed" as any,
        resolvedAt: new Date(),
        resolvedBy: dismissedBy,
      })
      .where(
        and(
          eq(exceptions.id, exceptionId),
          eq(exceptions.orgId, orgId)
        )
      )
      .returning();

    if (updated) {
      await db.insert(auditLog).values({
        orgId,
        action: "UPDATE",
        tableName: "exceptions",
        recordId: exceptionId,
        userId: dismissedBy,
        description: "Exception dismissed",
      });
    }

    return updated;
  },

  /**
   * Get exception statistics
   */
  async getStatistics(orgId: string) {
    // Get counts by severity
    const allExceptions = await db
      .select()
      .from(exceptions)
      .where(eq(exceptions.orgId, orgId));

    const severityMap: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const statusMap: Record<string, number> = {
      open: 0,
      in_review: 0,
      resolved: 0,
      dismissed: 0,
    };

    allExceptions.forEach((exc) => {
      severityMap[exc.severity] = (severityMap[exc.severity] || 0) + 1;
      statusMap[exc.status] = (statusMap[exc.status] || 0) + 1;
    });

    return {
      totalExceptions: allExceptions.length,
      bySeverity: severityMap,
      byStatus: statusMap,
      blockingPipeline: allExceptions.filter((e) => e.blocksPipeline).length,
    };
  },
};
