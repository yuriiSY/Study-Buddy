import express from "express";

import authControllers from "../controllers/authController.js";
import authenticateToken from "../middlewares/authMiddlewar.js";

const authRouter = express.Router();

authRouter.post("/signup", authControllers.signup);
authRouter.post("/signin", authControllers.signin);
authRouter.get("/profile", authenticateToken, authControllers.getProfile);
authRouter.patch("/profile", authenticateToken, authControllers.updateProfile);

export default authRouter;
