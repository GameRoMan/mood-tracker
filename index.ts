import config from "./config.json" assert { type: "json" };
import cookieParser from "cookie-parser";
import {
  urlencoded as bodyParser_urlencoded,
  json as bodyParser_json,
} from "body-parser";
import express from "express";

import "express-async-errors";

import { initDatabase } from "~/lib/db";
import { initTasks } from "~/lib/tasks";
import { router } from "~/.";

const app = express();

app.use(bodyParser_urlencoded({ extended: true }));
app.use(bodyParser_json({ strict: true }));
app.use(cookieParser());
app.use("/", router);

process.on("uncaughtException", (e) => console.error(e));
process.on("unhandledRejection", (e) => console.error(e));

app.listen(config.port, async () => {
  // await initDatabase();
  // await initTasks();

  console.log(`Listening on :${config.port}`);
});
