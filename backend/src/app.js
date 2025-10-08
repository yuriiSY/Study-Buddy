import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRouter.js";
import dotenv from "dotenv";

dotenv.config();
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Backend running...");
});
