import { db } from "@/server/db/client";
import { notifications } from "@/server/db/schema";
import { eq, and, desc, gt, isNull, isNotNull, or, lt, count } from "drizzle-orm";

export type NotificationType =
  | "status_change"
  | "document_processed"
  | "validation_complete"
  | "calculation_complete"
  | "petition_generated"
  | "exception_raised"
  | "system_info"
  | "system_warning"
  | "system_error";

export interface CreateNotificationInput {
  userId: string;
  orgId: string;
  type: NotificationType;
  title: string;
  message: string;
  caseId?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
  expiresAt?: Date;
}

export const notificationsService = {
  /**
   * Create a new notification
   */
  async create(input: CreateNotificationInput) {
    const values = {
      userId: input.userId,
      orgId: input.orgId,
      type: input.type,
      title: input.title,
      message: input.message,
      caseId: input.caseId,
      actionUrl: input.actionUrl,
      data: input.data || {},
      expiresAt: input.expiresAt,
    };
    const [notification] = await db
      .insert(notifications)
      .values(values)
      .returning();

    return notification;
  },

  /**
   * Get unread notifications for a user
   */
  async getUnread(userId: string, limit = 10) {
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date()))
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  },

  /**
   * Get all notifications for a user with pagination
   */
  async list(userId: string, limit = 20, offset = 0) {
    const items = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ value: count() })
      .from(notifications)
      .where(eq(notifications.userId, userId));

    const total = countResult[0]?.value || 0;

    return {
      items,
      total,
      limit,
      offset,
    };
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string) {
    const [updated] = await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return updated;
  },

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
  },

  /**
   * Delete a notification
   */
  async delete(notificationId: string) {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  },

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string) {
    const result = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
          or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date()))
        )
      );

    return result[0]?.value || 0;
  },

  /**
   * Cleanup expired notifications
   */
  async cleanupExpired() {
    await db
      .delete(notifications)
      .where(
        and(isNotNull(notifications.expiresAt), lt(notifications.expiresAt, new Date()))
      );
  },
};
