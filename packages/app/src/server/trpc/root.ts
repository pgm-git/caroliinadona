import { router, createCallerFactory } from "./trpc";
import { healthRouter } from "./routers/health";
import { documentsRouter } from "./routers/documents";
import { casesRouter } from "./routers/cases";
import { queueRouter } from "./routers/queue";
import { extractionRouter } from "./routers/extraction";
import { validationRouter } from "./routers/validation";
import { classificationRouter } from "./routers/classification";
import { calculationRouter } from "./routers/calculation";
import { petitionRouter } from "./routers/petition";
import { workflowRouter } from "./routers/workflow";
import { dashboardRouter } from "./routers/dashboard";
import { notificationsRouter } from "./routers/notifications";
import { reportsRouter } from "./routers/reports";
import { exceptionsRouter } from "./routers/exceptions";

export const appRouter = router({
  health: healthRouter,
  documents: documentsRouter,
  cases: casesRouter,
  queue: queueRouter,
  extraction: extractionRouter,
  validation: validationRouter,
  classification: classificationRouter,
  calculation: calculationRouter,
  petition: petitionRouter,
  workflow: workflowRouter,
  dashboard: dashboardRouter,
  notifications: notificationsRouter,
  reports: reportsRouter,
  exceptions: exceptionsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
