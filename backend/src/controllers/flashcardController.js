import {
  getFlashcardsByFileId,
  getFlashcardById,
  createFlashcard,
  appendFlashcards,
  deleteFlashcard,
} from "../services/flashcardService.js";

export const getFlashcardsForFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: "fileId is required" });
    }

    const flashcards = await getFlashcardsByFileId(fileId);
    return res.json(flashcards);
  } catch (error) {
    console.error("Error loading flashcards for file:", error);
    return res.status(500).json({ message: "Failed to load flashcards for file" });
  }
};

export const getSingleFlashcard = async (req, res) => {
  try {
    const { flashcardId } = req.params;

    const flashcard = await getFlashcardById(flashcardId);

    if (!flashcard) {
      return res.status(404).json({ message: "Flashcard set not found" });
    }

    res.json(flashcard);
  } catch (error) {
    console.error("Error loading flashcard:", error);
    res.status(500).json({ message: "Failed to load flashcard" });
  }
};

export const createFlashcardSet = async (req, res) => {
  try {
    const { file_id, title, description, cards, level } = req.body;

    const flashcard = await createFlashcard({
      file_id,
      title,
      description,
      cards,
      level,
    });

    res.status(201).json(flashcard);
  } catch (err) {
    console.error("Create flashcard error:", err);
    res.status(500).json({ error: "Failed to create flashcard" });
  }
};

export const appendMoreFlashcards = async (req, res) => {
  try {
    const { flashcardId } = req.params;
    const { cards } = req.body;

    if (!flashcardId || !cards) {
      return res.status(400).json({ message: "flashcardId and cards are required" });
    }

    const updated = await appendFlashcards(flashcardId, cards);

    res.json(updated);
  } catch (err) {
    console.error("Append flashcards error:", err);
    res.status(500).json({ error: "Failed to append flashcards" });
  }
};

export const deleteExistingFlashcard = async (req, res) => {
  try {
    const { flashcardId } = req.params;

    await deleteFlashcard(flashcardId);

    res.json({ message: "Flashcard set deleted successfully" });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    res.status(500).json({ message: "Failed to delete flashcard" });
  }
};
