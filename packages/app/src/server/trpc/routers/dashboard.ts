import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/client";
import { cases as casesTable } from "@/server/db/schema";
import { eq, and, count } from "drizzle-orm";

export const dashboardRouter = router({
  /**
   * Obtém métricas do dashboard.
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    // Total de casos
    const [{ total }] = await db
      .select({ total: count() })
      .from(casesTable)
      .where(eq(casesTable.orgId, ctx.orgId));

    // Casos por status
    const statusBreakdown = await db
      .select({
        status: casesTable.status,
        count: count(),
      })
      .from(casesTable)
      .where(eq(casesTable.orgId, ctx.orgId))
      .groupBy(casesTable.status);

    // Meus casos (últimos 10 casos da organização)
    const myCases = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.orgId, ctx.orgId))
      .orderBy(casesTable.createdAt)
      .limit(10);

    // Casos recentes
    const recent = await db
      .select()
      .from(casesTable)
      .where(eq(casesTable.orgId, ctx.orgId))
      .orderBy(casesTable.createdAt)
      .limit(5);

    return {
      total,
      statusBreakdown,
      myCases,
      recent,
    };
  }),
});
