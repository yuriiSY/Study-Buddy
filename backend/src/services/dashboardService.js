import prisma from "../config/prisma.js";
import * as streakService from "./streakService.js";

export const getDashboardStats = async (userId) => {
  userId = Number(userId);

  const totalModules = await prisma.module.count();

  const totalCompleted = await prisma.moduleCompletion.count({
    where: { userId },
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
