import express from "express";
import multer from "multer";
import {
  uploadFile,
  getUserFiles,
  getFileHtml,
} from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("file"), uploadFile);
router.get("/", getUserFiles);
router.get("/:id", getFileHtml);

export default router;
