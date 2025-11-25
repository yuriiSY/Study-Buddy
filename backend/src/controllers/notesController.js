import { getNote, upsertNote, appendToNote } from "../services/notesService.js";

export const getUserNote = async (req, res) => {
  try {
    const userId = Number(req.query.userId);
    const fileId = Number(req.query.fileId);

    const note = await getNote(userId, fileId);

    return res.json(note ?? { content: "" });
  } catch (error) {
    console.error("Error loading note:", error);
    return res.status(500).json({ message: "Failed to load note" });
  }
};

export const saveNote = async (req, res) => {
  try {
    const { userId, fileId, content } = req.body;

    const note = await upsertNote(Number(userId), Number(fileId), content);

    return res.json(note);
  } catch (error) {
    console.error("Error saving note:", error);
    return res.status(500).json({ message: "Failed to save note" });
  }
};

export const appendNote = async (req, res) => {
  try {
    const { userId, fileId, text } = req.body;

    const note = await appendToNote(Number(userId), Number(fileId), text);

    return res.json(note);
  } catch (error) {
    console.error("Error appending note:", error);
    return res.status(500).json({ message: "Failed to append note" });
  }
};
