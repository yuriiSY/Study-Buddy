import express from "express";
import {
  createFlashcards,
  getSingleFlashcards,
  listFlashcards,
} from "../controllers/flashcardsController.js";

const router = express.Router();

router.post("/", createFlashcards);
router.get("/", listFlashcards);
router.get("/:id", getSingleFlashcards);

export default router;
