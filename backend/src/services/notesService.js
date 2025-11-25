import prisma from "../config/prisma.js";

export const NotesService = {
  getNote: async (userId, fileId) => {
    return prisma.note.findUnique({
      where: {
        userId_fileId: { userId, fileId },
      },
    });
  },

  upsertNote: async (userId, fileId, content) => {
    return prisma.note.upsert({
      where: {
        userId_fileId: { userId, fileId },
      },
      update: { content },
      create: { userId, fileId, content },
    });
  },

  appendToNote: async (userId, fileId, text) => {
    const existing = await prisma.note.findUnique({
      where: { userId_fileId: { userId, fileId } },
    });

    const newContent = (existing?.content || "") + "\n\n" + text;

    return prisma.note.upsert({
      where: { userId_fileId: { userId, fileId } },
      update: { content: newContent },
      create: { userId, fileId, content: text },
    });
  },
};
