import { router as appRouter } from "./routers/app";
import { router as apiRouter } from "./routers/api";
import { router as authRouter } from "./routers/auth";
import { router as settingsRouter } from "./routers/settings";

import { Elysia } from "elysia";

export const router = new Elysia()
  .use(appRouter)
  .use(apiRouter)
  .use(authRouter)
  .use(settingsRouter);
