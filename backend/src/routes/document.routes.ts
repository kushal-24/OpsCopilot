import { Router } from "express";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware";
import apiError from "../utils/apiError.js";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
} from "../controllers/document.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB - SOPs are plain text
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    if (!name.endsWith(".md") && !name.endsWith(".txt")) {
      cb(new apiError(400, "Only .md and .txt files are accepted"));
      return;
    }
    cb(null, true);
  },
});

const router = Router();

router.use(verifyJWT);

router.post("/", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.delete("/:id", deleteDocument);

export default router;
