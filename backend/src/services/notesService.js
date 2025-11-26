import prisma from "../config/prisma.js";

export const getNote = async (userId, fileId) => {
  return prisma.note.findUnique({
    where: {
      userId_fileId: { userId, fileId },
    },
  });
};

export const upsertNote = async (userId, fileId, content) => {
  return prisma.note.upsert({
    where: {
      userId_fileId: { userId, fileId },
    },
    update: { content },
    create: { userId, fileId, content },
  });
};

export const appendToNote = async (userId, fileId, text) => {
  console.log("Appending to note - fileId1:", fileId, "text:", text);
  const existing = await prisma.note.findUnique({
    where: { userId_fileId: { userId, fileId } },
  });

  const newContent = (existing?.content || "") + "\n\n" + text;

  return prisma.note.upsert({
    where: { userId_fileId: { userId, fileId } },
    update: { content: newContent },
    create: { userId, fileId, content: text },
  });
};
