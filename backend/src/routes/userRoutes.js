import { Router } from "express";
import { getUsers } from "../controllers/userController.js";

const router = Router();

router.get("/", getUsers);

export default router;
