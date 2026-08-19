import { Router } from "express";
import {
  createSession,
  listSessions,
  getSessionMessages,
  sendMessage,
  deleteSession,
} from "../controllers/chat.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(verifyJWT);

router.post("/sessions", createSession);
router.get("/sessions", listSessions);
router.get("/sessions/:sessionId/messages", getSessionMessages);
router.post("/sessions/:sessionId/messages", sendMessage);
router.delete("/sessions/:sessionId", deleteSession);

export default router;
