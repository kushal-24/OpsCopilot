import { Router } from "express";
import multer from "multer";
import { verifyJWT } from "../middlewares/auth.middleware";
import apiError from "../utils/apiError.js";
import {
  uploadDataset,
  useDemoDataset,
  getCurrentDatasetInfo,
} from "../controllers/dataset.controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" || file.originalname.toLowerCase().endsWith(".csv");

    if (!isCsv) {
      cb(new apiError(400, "Only .csv files are accepted"));
      return;
    }

    cb(null, true);
  },
});

const router = Router();

router.use(verifyJWT);

router.post("/upload", upload.single("file"), uploadDataset);
router.post("/demo", useDemoDataset);
router.get("/me", getCurrentDatasetInfo);

export default router;
