import { router, createCallerFactory } from "./trpc";
import { healthRouter } from "./routers/health";
import { documentsRouter } from "./routers/documents";
import { casesRouter } from "./routers/cases";
import { queueRouter } from "./routers/queue";
import { extractionRouter } from "./routers/extraction";
import { validationRouter } from "./routers/validation";
import { classificationRouter } from "./routers/classification";

export const appRouter = router({
  health: healthRouter,
  documents: documentsRouter,
  cases: casesRouter,
  queue: queueRouter,
  extraction: extractionRouter,
  validation: validationRouter,
  classification: classificationRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
