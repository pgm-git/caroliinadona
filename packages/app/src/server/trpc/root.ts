import { router, createCallerFactory } from "./trpc";
import { healthRouter } from "./routers/health";
import { documentsRouter } from "./routers/documents";
import { casesRouter } from "./routers/cases";
import { queueRouter } from "./routers/queue";
import { extractionRouter } from "./routers/extraction";

export const appRouter = router({
  health: healthRouter,
  documents: documentsRouter,
  cases: casesRouter,
  queue: queueRouter,
  extraction: extractionRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
