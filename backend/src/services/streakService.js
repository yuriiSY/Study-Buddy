import prisma from "../config/prisma.js";

function toDateOnly(date) {
  return new Date(date.toISOString().split("T")[0]);
}

function getWeekStartMonday(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  return toDateOnly(d);
}

export async function markStudied(userId, dateStr) {
  const date = toDateOnly(new Date(dateStr));
  return prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, studied: true },
    update: { studied: true },
  });
}

export async function getWeekData(userId, refDateStr) {
  const ref = new Date(refDateStr);
  const day = ref.getDay();

  const weekStartSunday = new Date(ref);
  weekStartSunday.setDate(ref.getDate() - day);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStartSunday);
    d.setDate(weekStartSunday.getDate() + i);
    dates.push(toDateOnly(d));
  }

  const activities = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: { in: dates },
    },
  });

  const map = {};
  activities.forEach((a) => {
    map[a.date.toISOString().split("T")[0]] = a.studied;
  });

  const weekStartMonday = getWeekStartMonday(refDateStr);
  const forgiveness = await prisma.weeklyForgiveness.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart: weekStartMonday,
      },
    },
  });

  return {
    weekData: dates.map((d) => ({
      date: d.toISOString().split("T")[0],
      studied: !!map[d.toISOString().split("T")[0]],
    })),
    forgivenessUsed: forgiveness?.used || false,
  };
}

export async function forgiveMissed(userId, dateStr) {
  const date = toDateOnly(new Date(dateStr));
  const weekStart = getWeekStartMonday(dateStr);

  const existing = await prisma.weeklyForgiveness.findUnique({
    where: {
      userId_weekStart: {
        userId,
        weekStart,
      },
    },
  });

  if (existing?.used) {
    throw new Error("Forgiveness already used this week");
  }

  await prisma.dailyActivity.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, studied: true },
    update: { studied: true },
  });

  await prisma.weeklyForgiveness.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, used: true },
    update: { used: true },
  });

  return { success: true };
}

export async function calculateStreak(userId) {
  const today = toDateOnly(new Date());
  const oneYear = new Date();
  oneYear.setDate(today.getDate() - 365);

  const activities = await prisma.dailyActivity.findMany({
    where: {
      userId,
      date: {
        gte: oneYear,
        lte: today,
      },
    },
    orderBy: { date: "desc" },
  });

  const map = {};
  activities.forEach((a) => {
    map[a.date.toISOString().split("T")[0]] = a.studied;
  });

  let streak = 0;
  const cursor = new Date(today);

  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (map[key]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }

  return streak;
}
