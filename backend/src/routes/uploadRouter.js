import express from "express";
import multer from "multer";
import {
  uploadFiles,
  getFileHtml,
  getFileUrl,
  getUserModules,
  getFilesByModule,
  updateModuleTitle,
  archiveModule,
  unarchiveModule,
  deleteModule,
  addCollaborator,
  removeCollaborator,
  getCollaborators,
  searchModulesByTitle,
  leaveModule,
} from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

//router.post("/upload", upload.array("files", 10), uploadFiles);
router.post("/upload", uploadFiles);
router.get("/modules", getUserModules);
router.get("/modules/:moduleId/files", getFilesByModule);
router.get("/modules/:moduleId/files/:id", getFileHtml);
router.get("/modules/:fileId", getFileUrl);
router.put("/modules/:moduleId/title", updateModuleTitle);
router.put("/modules/:moduleId/archive", archiveModule);
router.put("/modules/:moduleId/unarchive", unarchiveModule);
router.delete("/modules/:moduleId", deleteModule);
router.get("/modules/search", searchModulesByTitle);

router.post("/modules/:moduleId/collaborators", addCollaborator);
router.get("/modules/:moduleId/quit", leaveModule);
router.get("/modules/:moduleId/collaborators", getCollaborators);
router.delete(
  "/modules/:moduleId/collaborators/:collaboratorId",
  removeCollaborator
);

export default router;
