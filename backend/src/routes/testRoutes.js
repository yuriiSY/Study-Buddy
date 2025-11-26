import express from "express";
import {
  getLeaderboard,
  saveScore,
  getSingleTest,
  deleteExistingTest,
  getTestsForFile,
} from "../controllers/testController.js";

const router = express.Router();

router.get("/leaderboard", getLeaderboard);
router.post("/score", saveScore);
router.get("/:testId", getSingleTest);
router.delete("/:testId", deleteExistingTest);
router.get("/file/:fileId", getTestsForFile);

export default router;
