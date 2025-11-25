import express from "express";
import {
  getUserNote,
  saveNote,
  appendNote,
} from "../controllers/notesController.js";

const router = express.Router();

router.get("/", getUserNote);
router.post("/", saveNote);
router.post("/notes/append", appendNote);

export default router;
