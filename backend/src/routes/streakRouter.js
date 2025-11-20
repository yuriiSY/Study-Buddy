import express from "express";
import * as streakController from "../controllers/streakController.js";

const router = express.Router();

router.post("/study", streakController.markStudied);
router.get("/week", streakController.getWeek);
router.post("/forgive", streakController.forgive);
router.get("/streak", streakController.getStreak);

export default router;
