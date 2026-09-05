import { Router } from "express";
import { getEvents } from "../controllers/explorer.controller";

const router = Router();

router.get("/", getEvents);

export default router;
