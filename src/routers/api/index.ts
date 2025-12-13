import { Elysia } from "elysia";

import { router as metricsRouter } from "./routers/prometheus.js";
import { router as historyRouter } from "./routers/history.js";
import { router as moodRouter } from "./routers/mood.js";
import { router as meRouter } from "./routers/me.js";

export const router = new Elysia({ prefix: "/api" })
  .use(meRouter)
  .use(moodRouter)
  .use(historyRouter)
  .use(metricsRouter);
