import prisma from "../config/prisma.js";

export const createFlashcardsInDB = async (data) => {
  return prisma.flashcards.create({
    data: {
      title: data.title || "Flashcards",
      description: data.description || null,
      file_ids: data.file_ids,
      cards: {
        flashcards: data.flashcards,
        total_generated: data.total_generated,
      },
      total_cards: data.total_generated,
    },
  });
};

export const getFlashcardsById = async (id) => {
  return prisma.flashcards.findUnique({
    where: { id },
  });
};

export const listAllFlashcards = async () => {
  return prisma.flashcards.findMany({
    orderBy: { created_at: "desc" },
  });
};
