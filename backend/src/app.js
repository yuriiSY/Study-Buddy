import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRouter from "./routes/authRouter.js";
import aiRouter from "./routes/ai.js";
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

//ai route
const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true })); // adjust for your dev origin

app.use("/api/ai", aiRouter);

export default app;