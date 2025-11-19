import express from "express";
import auth from "../middleware/auth.js";
import * as streakController from "../controllers/streakController.js";

const router = express.Router();

router.post("/study", auth, streakController.markStudied);
router.get("/week", auth, streakController.getWeek);
router.post("/forgive", auth, streakController.forgive);
router.get("/streak", auth, streakController.getStreak);

export default router;
