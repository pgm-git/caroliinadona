import { notificationsService } from "@/server/services/notifications.service";

export const exceptionNotificationsService = {
  /**
   * Notify organization coordinators when exception is created
   */
  async notifyExceptionCreated(
    exceptionId: string,
    exceptionTitle: string,
    severity: string,
    caseId: string,
    orgId: string,
    userIds: string[]
  ) {
    const severityLabel: Record<string, string> = {
      low: "Baixa",
      medium: "Média",
      high: "Alta",
      critical: "Crítica",
    };

    for (const userId of userIds) {
      await notificationsService.create({
        userId,
        orgId,
        type: "exception_raised",
        title: "Nova Exceção",
        message: `${exceptionTitle} (Severidade: ${severityLabel[severity] || severity})`,
        caseId,
        actionUrl: `/exceptions?caseId=${caseId}`,
      });
    }
  },

  /**
   * Notify creator when exception is resolved
   */
  async notifyExceptionResolved(
    exceptionTitle: string,
    resolution: string,
    caseId: string,
    orgId: string,
    userId: string
  ) {
    await notificationsService.create({
      userId,
      orgId,
      type: "exception_raised",
      title: "Exceção Resolvida",
      message: `${exceptionTitle} foi resolvida`,
      caseId,
      actionUrl: `/cases/${caseId}`,
    });
  },

  /**
   * Notify when blocking pipeline exception is created
   */
  async notifyBlockingException(
    exceptionTitle: string,
    severity: string,
    caseId: string,
    orgId: string,
    adminUserIds: string[]
  ) {
    for (const userId of adminUserIds) {
      await notificationsService.create({
        userId,
        orgId,
        type: "system_warning",
        title: "Exceção Crítica - Pipeline Bloqueado",
        message: `${exceptionTitle} está bloqueando o pipeline do caso`,
        caseId,
        actionUrl: `/exceptions?severity=critical`,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      });
    }
  },
};
