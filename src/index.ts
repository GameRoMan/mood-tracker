import { router as appRouter } from "./routers/app.js";
import { router as apiRouter } from "./routers/api/index.js";
import { router as authRouter } from "./routers/auth.js";
import { router as settingsRouter } from "./routers/settings.js";

import { Elysia } from "elysia";

const router = new Elysia()
  .onError(({ code, status }) => {
    if (code === "NOT_FOUND") {
      status(404); //.render("pages/error/404")
    }
    status(500); //.render("pages/error/500");
  })
  .use("/", appRouter)
  .use("/api", apiRouter)
  .use("/auth", authRouter)
  .use("/settings", settingsRouter);

export { router };
