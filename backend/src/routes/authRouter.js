import express from "express";

import authControllers from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/signup", authControllers.signup);
authRouter.post("/signin", authControllers.signin);

export default authRouter;
