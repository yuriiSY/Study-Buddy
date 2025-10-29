import express from "express";
import multer from "multer";
import {
  uploadFiles,
  getFileHtml,
  getUserModules,
  getFilesByModule,
} from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.array("files", 10), uploadFiles);
router.get("/modules", getUserModules);
router.get("/modules/:moduleId/files", getFilesByModule);
router.get("/modules/:moduleId/files/:id", getFileHtml);

export default router;
