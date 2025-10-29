import express from "express";
import multer from "multer";
import {
  uploadFiles,
  getUserFiles,
  getFileHtml,
  getUserModules,
} from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.array("files", 10), uploadFiles);
router.get("/modules", getUserModules);
router.get("/", getUserFiles);
router.get("/:id", getFileHtml);

export default router;
