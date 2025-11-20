import * as streakService from "../services/streakService.js";

export const markStudied = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;

  try {
    const result = await streakService.markStudied(userId, date);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWeek = async (req, res) => {
  const userId = req.user.id;
  const refDate = req.query.refDate || new Date().toISOString();

  try {
    const data = await streakService.getWeekData(userId, refDate);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const forgive = async (req, res) => {
  const userId = req.user.id;
  const { date } = req.body;

  try {
    const result = await streakService.forgiveMissed(userId, date);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getStreak = async (req, res) => {
  const userId = req.user.id;

  try {
    const streak = await streakService.calculateStreak(userId);
    res.json({ streak });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
