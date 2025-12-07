// pomodoro.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function startPomodoroSession({
  userId,
  durationSec,
  breakSec,
  type,
}) {
  return prisma.pomodoroSession.create({
    data: {
      userId,
      startTime: new Date(),
      durationSec,
      breakSec,
      type,
    },
  });
}

export async function completePomodoroSession(id) {
  return prisma.pomodoroSession.update({
    where: { id },
    data: {
      endTime: new Date(),
      completed: true,
    },
  });
}

export async function getUserDailyPomodoroSessions(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return prisma.pomodoroSession.findMany({
    where: { userId, startTime: { gte: today } },
    orderBy: { startTime: "asc" },
  });
}
