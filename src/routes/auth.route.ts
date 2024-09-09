import { Router } from "express";
import { getAuthUser, login, logout, signup } from "../controllers/auth.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/me", getAuthUser);
router.get("/logout", logout);

export default router;
