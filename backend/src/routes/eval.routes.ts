import { Router } from "express";
import { getLatestRun, listRuns, getRunById } from "../controllers/eval.controller";

const router = Router();

router.get("/latest", getLatestRun);
router.get("/runs", listRuns);
router.get("/runs/:runId", getRunById);

export default router;
