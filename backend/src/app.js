import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRouter.js";
import uploadRouter from "./routes/uploadRouter.js";
import authenticateToken from "./middlewares/authMiddlewar.js";
import streakRouter from "./routes/streakRouter.js";
import notesRouter from "./routes/notesRouter.js";
import testRouter from "./routes/testRoutes.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import flashcardRouter from "./routes/flashcardRoutes.js";
import pomodoroRoutes from "./routes/pomodoroRoutes.js";

import dotenv from "dotenv";

dotenv.config();
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/files", authenticateToken, uploadRouter);
app.use("/api/streak", authenticateToken, streakRouter);
app.use("/api/notes", authenticateToken, notesRouter);
app.use("/api/test", authenticateToken, testRouter);

app.use("/api/dashboard", authenticateToken, dashboardRouter);

app.use("/api/flashcards", authenticateToken, flashcardRouter);
app.use("/pomodoro", authenticateToken, pomodoroRoutes);

app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Backend running...");
});
