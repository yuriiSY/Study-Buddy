import prisma from "../config/prisma.js";
import * as streakService from "./streakService.js";

export const getDashboardStats = async (userId) => {
  userId = Number(userId);

  const ownedModules = await prisma.module.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });

  const colaboratedModules = await prisma.collaboration.findMany({
    where: { userId },
    select: { moduleId: true },
  });

  const userModuleIds = [
    ...new Set([
      ...ownedModules.map((m) => m.id),
      ...colaboratedModules.map((c) => c.moduleId),
    ]),
  ];

  const totalModules = userModuleIds.length;

  const totalCompleted = await prisma.moduleCompletion.count({
    where: {
      userId,
      moduleId: { in: userModuleIds },
    },
  });

  const overallProgress =
    totalModules === 0
      ? 0
      : Number(((totalCompleted / totalModules) * 100).toFixed(2));

  const totalDaysInRow = await streakService.calculateStreak(userId);

  const scores = await prisma.testScore.findMany({
    where: { userId },
    include: { test: true },
  });

  let totalScore = 0;
  let totalPossible = 0;

  for (const s of scores) {
    totalScore += s.score;
    totalPossible += s.test.total_questions || 0;
  }

  const averageTestScore =
    totalPossible === 0
      ? 0
      : Number(((totalScore / totalPossible) * 100).toFixed(2));

  return {
    totalModules,
    totalCompleted,
    overallProgress,
    totalDaysInRow,
    averageTestScore,
  };
};
