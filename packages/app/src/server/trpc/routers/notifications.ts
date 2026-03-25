import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { notificationsService } from "@/server/services/notifications.service";
import { TRPCError } from "@trpc/server";

export const notificationsRouter = router({
  /**
   * Get unread notifications for the current user
   */
  getUnread: protectedProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input, ctx }) => {
      return notificationsService.getUnread(ctx.user.id, input.limit);
    }),

  /**
   * Get all notifications with pagination
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(10).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const offset = (input.page - 1) * input.pageSize;
      return notificationsService.list(ctx.user.id, input.pageSize, offset);
    }),

  /**
   * Get unread count for the current user
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const count = await notificationsService.getUnreadCount(ctx.user.id);
    return { unreadCount: count };
  }),

  /**
   * Mark a notification as read
   */
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const notification = await notificationsService.markAsRead(
        input.notificationId
      );
      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notificação não encontrada.",
        });
      }
      return notification;
    }),

  /**
   * Mark all notifications as read for the current user
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationsService.markAllAsRead(ctx.user.id);
    return { success: true };
  }),

  /**
   * Delete a notification
   */
  delete: protectedProcedure
    .input(z.object({ notificationId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await notificationsService.delete(input.notificationId);
      return { success: true };
    }),
});
