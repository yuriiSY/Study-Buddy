import express from "express";
import { NotesController } from "../controllers/notesController";

const router = express.Router();

router.get("/", NotesController.getNote);
router.post("/", NotesController.saveNote);
router.post("/append", NotesController.appendNote);

export default router;
