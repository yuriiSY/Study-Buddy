import { NotesService } from "../services/notes.service.js";

export const NotesController = {
  getNote: async (req, res) => {
    try {
      const { userId, fileId } = req.query;

      const note = await NotesService.getNote(Number(userId), Number(fileId));

      res.json(note || { content: "" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to load note" });
    }
  },

  saveNote: async (req, res) => {
    try {
      const { userId, fileId, content } = req.body;

      const note = await NotesService.upsertNote(
        Number(userId),
        Number(fileId),
        content
      );

      res.json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to save note" });
    }
  },

  appendNote: async (req, res) => {
    try {
      const { userId, fileId, text } = req.body;

      const note = await NotesService.appendToNote(
        Number(userId),
        Number(fileId),
        text
      );

      res.json(note);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to append note" });
    }
  },
};
