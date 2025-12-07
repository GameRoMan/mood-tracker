import config from "./config.json" assert { type: "json" };

import { initDatabase } from "~/lib/db";
import { initTasks } from "~/lib/tasks";
import { router } from "~/.";

import { Elysia } from "elysia";

const app = new Elysia();

app.use(router);

process.on("uncaughtException", (e) => console.error(e));
process.on("unhandledRejection", (e) => console.error(e));

app.listen(config.port, async () => {
  // await initDatabase();
  // await initTasks();

  console.log(`Listening on :${config.port}`);
});
