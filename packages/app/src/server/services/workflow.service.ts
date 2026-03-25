/**
 * Serviço de workflow — máquina de estados para pipeline do case.
 * Valida transições entre etapas do processo.
 */

import { db } from "@/server/db/client";
import { cases as casesTable, auditLog, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

type CaseStatus =
  | "received"
  | "analyzing"
  | "extraction_complete"
  | "validation_pending"
  | "validated"
  | "calculation_pending"
  | "calculated"
  | "petition_generating"
  | "petition_generated"
  | "reviewed"
  | "filed"
  | "exception";

/**
 * Estados válidos do pipeline.
 */
export const WORKFLOW_STATES = {
  RECEIVED: "received" as const,
  ANALYZING: "analyzing" as const,
  EXTRACTION_COMPLETE: "extraction_complete" as const,
  VALIDATION_PENDING: "validation_pending" as const,
  VALIDATED: "validated" as const,
  CALCULATION_PENDING: "calculation_pending" as const,
  CALCULATED: "calculated" as const,
  PETITION_GENERATING: "petition_generating" as const,
  PETITION_GENERATED: "petition_generated" as const,
  REVIEWED: "reviewed" as const,
  FILED: "filed" as const,
  EXCEPTION: "exception" as const,
};

/**
 * Transições válidas no pipeline.
 * Define quais estados podem transicionar para quais.
 */
const VALID_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  received: ["analyzing"],
  analyzing: ["extraction_complete", "exception"],
  extraction_complete: ["validation_pending", "exception"],
  validation_pending: ["validated", "analyzing", "exception"],
  validated: ["calculation_pending", "exception"],
  calculation_pending: ["calculated", "validation_pending", "exception"],
  calculated: ["petition_generating", "exception"],
  petition_generating: ["petition_generated", "calculated", "exception"],
  petition_generated: ["reviewed", "calculated", "exception"],
  reviewed: ["filed", "petition_generated", "exception"],
  filed: ["filed"], // Terminal state
  exception: ["analyzing", "validation_pending", "calculation_pending"], // Retorno de exceção
};

/**
 * Descrições das etapas (para UI).
 */
export const STATE_DESCRIPTIONS: Record<CaseStatus, string> = {
  received: "Caso recebido",
  analyzing: "Analisando documentos",
  extraction_complete: "Extração concluída",
  validation_pending: "Aguardando validação",
  validated: "Validado",
  calculation_pending: "Aguardando cálculo",
  calculated: "Cálculo realizado",
  petition_generating: "Gerando petição",
  petition_generated: "Petição gerada",
  reviewed: "Revisado",
  filed: "Protocolado",
  exception: "Em exceção",
};

export interface WorkflowTransitionParams {
  caseId: string;
  fromStatus: CaseStatus;
  toStatus: CaseStatus;
  orgId: string;
  userId: string;
  reason?: string;
}

export interface WorkflowHistory {
  id: string;
  caseId: string;
  action: "STATUS_CHANGE" | "ASSIGNED" | "REVERTED";
  fromStatus?: CaseStatus;
  toStatus?: CaseStatus;
  createdBy: string;
  reason?: string;
  createdAt: Date;
}

class WorkflowService {
  /**
   * Valida se uma transição de estado é permitida.
   */
  isTransitionValid(fromStatus: CaseStatus, toStatus: CaseStatus): boolean {
    const validTargets = VALID_TRANSITIONS[fromStatus];
    return validTargets.includes(toStatus);
  }

  /**
   * Avança o status de um case e registra no audit log.
   */
  async advanceStatus(params: WorkflowTransitionParams): Promise<void> {
    const { caseId, fromStatus, toStatus, orgId, userId, reason } = params;

    // 1. Valida transição
    if (!this.isTransitionValid(fromStatus, toStatus)) {
      throw new Error(
        `Invalid transition from ${fromStatus} to ${toStatus}. Valid transitions: ${VALID_TRANSITIONS[fromStatus].join(", ")}`
      );
    }

    // 2. Atualiza status do case
    await db
      .update(casesTable)
      .set({
        status: toStatus,
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId));

    // 3. Registra no audit log
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await db.insert(auditLog).values({
      orgId,
      action: "STATUS_CHANGE",
      tableName: "cases",
      recordId: caseId,
      userId,
      userEmail: user?.email,
      oldData: { status: fromStatus },
      newData: { status: toStatus },
      description: `Status changed from ${fromStatus} to ${toStatus}`,
      metadata: reason ? { reason } : {},
    });

    console.log(
      `[workflow] Case ${caseId} transitioned from ${fromStatus} to ${toStatus}`
    );
  }

  /**
   * Reverte um case para uma etapa anterior (com justificativa obrigatória).
   */
  async revertToStatus(
    caseId: string,
    targetStatus: CaseStatus,
    orgId: string,
    userId: string,
    reason: string
  ): Promise<void> {
    if (!reason || reason.trim().length === 0) {
      throw new Error("Reason is required for reverting case status");
    }

    // Busca case atual
    const [caseData] = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.id, caseId))
      .limit(1);

    if (!caseData) {
      throw new Error(`Case ${caseId} not found`);
    }

    // Valida que estamos revertendo (targetStatus deve ser anterior)
    const currentStatus = caseData.status as CaseStatus;
    if (currentStatus === targetStatus) {
      throw new Error("Target status is the same as current status");
    }

    // Atualiza status
    await db
      .update(casesTable)
      .set({
        status: targetStatus,
        updatedAt: new Date(),
      })
      .where(eq(casesTable.id, caseId));

    // Registra no audit log com reason
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    await db.insert(auditLog).values({
      orgId,
      action: "STATUS_CHANGE",
      tableName: "cases",
      recordId: caseId,
      userId,
      userEmail: user?.email,
      oldData: { status: currentStatus },
      newData: { status: targetStatus },
      description: `Status reverted from ${currentStatus} to ${targetStatus}: ${reason}`,
      metadata: { reason, reverted: true },
    });

    console.log(
      `[workflow] Case ${caseId} reverted from ${currentStatus} to ${targetStatus}: ${reason}`
    );
  }

  /**
   * Obtém o histórico completo de atividades de um case.
   */
  async getCaseHistory(caseId: string, orgId: string): Promise<WorkflowHistory[]> {
    const logs = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.recordId, caseId))
      .orderBy(auditLog.createdAt);

    return logs.map((log) => ({
      id: log.id,
      caseId: caseId,
      action: log.action as "STATUS_CHANGE" | "ASSIGNED" | "REVERTED",
      fromStatus: (log.oldData as { status?: string })?.status as CaseStatus | undefined,
      toStatus: (log.newData as { status?: string })?.status as CaseStatus | undefined,
      createdBy: log.userEmail || "System",
      reason: (log.metadata as { reason?: string })?.reason,
      createdAt: log.createdAt,
    }));
  }

  /**
   * Obtém os próximos estados válidos a partir do estado atual.
   */
  getNextStates(currentStatus: CaseStatus): CaseStatus[] {
    return VALID_TRANSITIONS[currentStatus];
  }

  /**
   * Obtém descrição legível de um estado.
   */
  getStateDescription(status: CaseStatus): string {
    return STATE_DESCRIPTIONS[status];
  }
}

export const workflowService = new WorkflowService();
