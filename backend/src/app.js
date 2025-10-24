// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRouter.js";
import aiRouter from "./routes/ai.js";

dotenv.config();

const app = express(); // makes a single instance of express

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health/base
app.get("/", (_req, res) => res.send("Backend running..."));
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRouter);
app.use("/api/ai", aiRouter);

export default app; // default export (no second const app, no re-init)