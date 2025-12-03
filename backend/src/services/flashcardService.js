import prisma from "../config/prisma.js";

export const getFlashcardsByFileId = async (fileId) => {
  return prisma.flashcards.findMany({
    where: {
      file_ids: {
        has: fileId,
      },
    },
    orderBy: { created_at: "desc" },
  });
};

export const getFlashcardById = async (flashcardId) => {
  return prisma.flashcards.findUnique({
    where: { id: flashcardId },
  });
};

export const createFlashcard = async ({
  file_id,
  title,
  description,
  cards,
}) => {
  if (!file_id || !cards) {
    throw new Error("file_id and cards are required");
  }

  return prisma.flashcards.create({
    data: {
      file_ids: [file_id],
      title,
      description,
      cards,
      total_cards: Array.isArray(cards) ? cards.length : 0,
    },
  });
};

export const appendFlashcards = async (flashcardId, newCards) => {
  const existing = await prisma.flashcards.findUnique({
    where: { id: flashcardId },
  });

  if (!existing) {
    throw new Error("Flashcard set not found");
  }

  const allCards = Array.isArray(existing.cards)
    ? [...existing.cards, ...newCards]
    : newCards;

  return prisma.flashcards.update({
    where: { id: flashcardId },
    data: {
      cards: allCards,
      total_cards: allCards.length,
    },
  });
};

export const deleteFlashcard = async (flashcardId) => {
  return prisma.flashcards.delete({
    where: { id: flashcardId },
  });
};
