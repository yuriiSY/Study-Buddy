import {
  startPomodoroSession,
  completePomodoroSession,
  getUserDailyPomodoroSessions,
} from "../services/pomodoroService.js";

export async function handleStartSession(req, res) {
  try {
    const { userId, durationSec, breakSec, type } = req.body;

    const session = await startPomodoroSession({
      userId,
      durationSec,
      breakSec,
      type,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({
      error: "Failed to start Pomodoro session",
      details: err.message,
    });
  }
}

export async function handleCompleteSession(req, res) {
  try {
    const id = Number(req.params.id);

    const session = await completePomodoroSession(id);

    res.json(session);
  } catch (err) {
    res.status(500).json({
      error: "Failed to complete Pomodoro session",
      details: err.message,
    });
  }
}

export async function handleGetDailySessions(req, res) {
  try {
    const userId = Number(req.params.userId);

    const sessions = await getUserDailyPomodoroSessions(userId);

    res.json(sessions);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch Pomodoro sessions",
      details: err.message,
    });
  }
}
