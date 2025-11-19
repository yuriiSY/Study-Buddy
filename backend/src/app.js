import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRouter.js";
import uploadRouter from "./routes/uploadRouter.js";
import streakRoutes from "./routes/streakRoutes.js";
import authenticateToken from "./middlewares/authMiddlewar.js";
import dotenv from "dotenv";

dotenv.config();
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/files", authenticateToken, uploadRouter);
app.use("/api/streak", authenticateToken, streakRoutes);
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Backend running...");
});
