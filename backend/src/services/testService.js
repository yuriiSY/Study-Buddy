import prisma from "../config/prisma.js";

export const getCollaboratorUserIds = async (moduleId) => {
  const collaborators = await prisma.collaboration.findMany({
    where: { moduleId },
    select: { userId: true },
  });

  return collaborators.map((c) => c.userId);
};

export const getFullLeaderboard = async (testId) => {
  return prisma.testScore.findMany({
    where: { testId },
    orderBy: { score: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
};

export const getLeaderboardForCollaborators = async (testId, moduleId) => {
  const allowedUserIds = await getCollaboratorUserIds(moduleId);

  if (!allowedUserIds.length) return [];

  return prisma.testScore.findMany({
    where: {
      testId,
      userId: { in: allowedUserIds },
    },
    orderBy: { score: "desc" },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
};

export const submitScore = async (userId, testId, score) => {
  return prisma.testScore.upsert({
    where: {
      userId_testId: { userId, testId },
    },
    create: { userId, testId, score },
    update: { score },
  });
};

export const getTestById = async (testId) => {
  return prisma.tests.findUnique({
    where: { id: testId },
  });
};

export const deleteTest = async (testId) => {
  return prisma.tests.delete({
    where: { id: testId },
  });
};

export const getTestsByFileId = async (fileId, userId) => {
  const tests = await prisma.tests.findMany({
    where: {
      file_ids: {
        has: fileId,
      },
    },
    orderBy: { created_at: "desc" },
  });

  if (!userId) return tests;

  const scoresMap = await prisma.testScore.findMany({
    where: {
      userId,
      testId: {
        in: tests.map((t) => t.id),
      },
    },
  });

  const scoresById = Object.fromEntries(
    scoresMap.map((s) => [s.testId, s.score])
  );

  return tests.map((test) => ({
    ...test,
    userScore: scoresById[test.id] || null,
  }));
};

export const createTestFromMCQs = async ({
  file_id,
  title,
  description,
  mcqs,
}) => {
  if (!file_id || !mcqs) {
    throw new Error("file_id and mcqs are required");
  }

  return prisma.tests.create({
    data: {
      file_ids: [file_id],
      title,
      description,
      questions: mcqs,
    },
  });
};
