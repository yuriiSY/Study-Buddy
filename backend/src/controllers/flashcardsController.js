import {
  createFlashcardsInDB,
  getFlashcardsById,
  listAllFlashcards,
} from "../services/flashcardService.js";

export const createFlashcards = async (req, res) => {
  try {
    const { flashcards, file_ids_used, total_generated, title, description } =
      req.body;

    if (!flashcards || !file_ids_used || !total_generated) {
      return res.status(400).json({
        message: "flashcards, file_ids_used, and total_generated are required",
      });
    }

    const newFlashcards = await createFlashcardsInDB({
      title,
      description,
      file_ids: file_ids_used,
      flashcards,
      total_generated,
    });

    return res.status(201).json(newFlashcards);
  } catch (err) {
    console.error("Error creating flashcards:", err);
    return res.status(500).json({ message: "Failed to create flashcards" });
  }
};

export const getSingleFlashcards = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await getFlashcardsById(id);

    if (!result) {
      return res.status(404).json({ message: "Flashcards not found" });
    }

    return res.json(result);
  } catch (err) {
    console.error("Error loading flashcards:", err);
    return res.status(500).json({ message: "Failed to load flashcards" });
  }
};

export const listFlashcards = async (req, res) => {
  try {
    const list = await listAllFlashcards();
    return res.json(list);
  } catch (err) {
    console.error("Error loading flashcards list:", err);
    return res.status(500).json({ message: "Failed to load flashcards list" });
  }
};
