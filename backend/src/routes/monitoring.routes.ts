import { Router } from "express";
import {
  getOverview,
  getSummary,
  getLatencyOverTime,
  getRequestVolumeOverTime,
  getRequestLog,
} from "../controllers/monitoring.controller";

const router = Router();

// One aggregated call for the monitoring page (summary + both time-series)
// so the frontend doesn't have to fan out three requests.
router.get("/overview", getOverview);

// Individual metrics, kept available for anything that needs just one.
router.get("/summary", getSummary);
router.get("/latency-over-time", getLatencyOverTime);
router.get("/request-volume-over-time", getRequestVolumeOverTime);

// Paginated/filterable raw request log for the future table.
router.get("/requests", getRequestLog);

export default router;
