import { db } from "@/server/db/client";
import { cases, documents, statusHistory } from "@/server/db/schema";
import { caseStatusEnum, caseTypeEnum } from "@/server/db/enums";
import { eq, and, isNull, desc, sql, ilike, or, count } from "drizzle-orm";
import { generateInternalReference } from "@/lib/cases/generate-reference";
import { getQueue, QUEUE_NAMES } from "@/server/queue";

export interface CreateCaseInput {
  orgId: string;
  title: string;
  caseType: "execution" | "collection";
  description?: string;
  courtId?: string;
  priority?: number;
  createdBy: string;
}

export interface ListCasesInput {
  orgId: string;
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  caseType?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export class CasesService {
  async create(input: CreateCaseInput) {
    // Count existing cases for today to generate sequence
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [{ value: todayCount }] = await db
      .select({ value: count() })
      .from(cases)
      .where(
        and(
          eq(cases.orgId, input.orgId),
          sql`${cases.createdAt} >= ${today.toISOString()}`
        )
      );

    const internalReference = generateInternalReference(
      Number(todayCount) + 1
    );

    const [newCase] = await db
      .insert(cases)
      .values({
        orgId: input.orgId,
        title: input.title,
        caseType: input.caseType,
        description: input.description,
        courtId: input.courtId,
        priority: input.priority ?? 3,
        internalReference,
        status: "received",
        createdBy: input.createdBy,
        metadata: {
          channel: "manual",
          createdTimestamp: new Date().toISOString(),
        },
      })
      .returning();

    // Record initial status
    await db.insert(statusHistory).values({
      orgId: input.orgId,
      caseId: newCase.id,
      previousStatus: "",
      newStatus: "received",
      changedBy: input.createdBy,
      reason: "Caso criado",
    });

    return newCase;
  }

  /**
   * Enqueue document processing jobs for a case.
   */
  async enqueueDocumentProcessing(
    caseId: string,
    orgId: string,
    documentIds: string[],
    priority: number = 3
  ) {
    const queue = getQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);
    for (const documentId of documentIds) {
      await queue.add(
        "process-document",
        {
          documentId,
          caseId,
          orgId,
          action: "ocr" as const,
        },
        { priority }
      );
    }
  }

  async list(input: ListCasesInput) {
    const conditions = [
      eq(cases.orgId, input.orgId),
      isNull(cases.deletedAt),
    ];

    if (input.search) {
      conditions.push(
        or(
          ilike(cases.title, `%${input.search}%`),
          ilike(cases.internalReference, `%${input.search}%`)
        )!
      );
    }

    if (input.status) {
      conditions.push(
        eq(
          cases.status,
          input.status as (typeof caseStatusEnum.enumValues)[number]
        )
      );
    }

    if (input.caseType) {
      conditions.push(
        eq(
          cases.caseType,
          input.caseType as (typeof caseTypeEnum.enumValues)[number]
        )
      );
    }

    const [totalResult] = await db
      .select({ value: count() })
      .from(cases)
      .where(and(...conditions));

    const total = Number(totalResult.value);

    const orderColumn =
      input.sortBy === "priority" ? cases.priority : cases.createdAt;
    const orderFn = input.sortOrder === "asc" ? sql`${orderColumn} ASC` : desc(orderColumn);

    const items = await db
      .select()
      .from(cases)
      .where(and(...conditions))
      .orderBy(orderFn)
      .limit(input.pageSize)
      .offset((input.page - 1) * input.pageSize);

    return {
      items,
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(total / input.pageSize),
    };
  }

  async getById(caseId: string, orgId: string) {
    const [caseRecord] = await db
      .select()
      .from(cases)
      .where(
        and(
          eq(cases.id, caseId),
          eq(cases.orgId, orgId),
          isNull(cases.deletedAt)
        )
      )
      .limit(1);

    if (!caseRecord) return null;

    const caseDocuments = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.caseId, caseId),
          eq(documents.orgId, orgId),
          isNull(documents.deletedAt)
        )
      )
      .orderBy(desc(documents.createdAt));

    const history = await db
      .select()
      .from(statusHistory)
      .where(eq(statusHistory.caseId, caseId))
      .orderBy(desc(statusHistory.changedAt));

    return {
      ...caseRecord,
      documents: caseDocuments,
      statusHistory: history,
    };
  }

  async update(
    caseId: string,
    orgId: string,
    data: Partial<{
      title: string;
      description: string;
      priority: number;
      courtId: string;
    }>
  ) {
    const [updated] = await db
      .update(cases)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(cases.id, caseId), eq(cases.orgId, orgId)))
      .returning();

    return updated;
  }
}

export const casesService = new CasesService();
