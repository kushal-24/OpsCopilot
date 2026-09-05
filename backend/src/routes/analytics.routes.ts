import { Router } from "express";
import {
  getDashboard,
  getSummary,
  getActivityPerformance,
  getThroughput,
  getSlowestCases,
  getCasesByStatus,
  getCasesByPriority,
  getDashboardInsight,
} from "../controllers/analytics.controller";

const router = Router();

// One aggregated call for the dashboard page (KPIs + both charts + table
// + breakdowns) so the frontend doesn't have to fan out six requests.
router.get("/dashboard", getDashboard);

// Individual metrics, kept available for anything that needs just one
// (e.g. the chat agent's tool-calling layer in a later phase).
router.get("/summary", getSummary);
router.get("/activity-performance", getActivityPerformance);
router.get("/throughput", getThroughput);
router.get("/slowest-cases", getSlowestCases);
router.get("/status", getCasesByStatus);
router.get("/priority", getCasesByPriority);

// LLM-generated plain-English summary of the dashboard's own numbers.
router.get("/insight", getDashboardInsight);

export default router;
