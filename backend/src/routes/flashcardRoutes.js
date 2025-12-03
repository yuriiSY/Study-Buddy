import express from "express";
import {
  getFlashcardsForFile,
  getSingleFlashcard,
  createFlashcardSet,
  appendMoreFlashcards,
  deleteExistingFlashcard,
} from "../controllers/flashcardController.js";

const router = express.Router();

router.get("/file/:fileId", getFlashcardsForFile);
router.get("/:flashcardId", getSingleFlashcard);
router.post("/", createFlashcardSet);
router.post("/:flashcardId/append", appendMoreFlashcards);
router.delete("/:flashcardId", deleteExistingFlashcard);

export default router;
