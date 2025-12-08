import { Router } from "express";

import {
  handleStartSession,
  handleCompleteSession,
  handleGetDailySessions,
} from "../controllers/pomodoroController.js";

const router = Router();

router.post("/start", handleStartSession);

router.post("/complete/:id", handleCompleteSession);

router.get("/user/sessions", handleGetDailySessions);

export default router;
