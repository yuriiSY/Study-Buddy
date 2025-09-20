import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";

export const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Backend running...");
});
