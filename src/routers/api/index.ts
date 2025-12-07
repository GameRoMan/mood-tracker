import express from "express";

import { router as metricsRouter } from "./routers/prometheus.js";
import { router as historyRouter } from "./routers/history.js";
import { router as moodRouter } from "./routers/mood.js";
import { router as meRouter } from "./routers/me.js";

export const router = express.Router();

router.use("/me", meRouter);
router.use("/mood", moodRouter);
router.use("/history", historyRouter);
router.use("/metrics", metricsRouter);

router.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

router.use((err, req, res, next) => {
  console.error(err);
  res.status(500);
});
