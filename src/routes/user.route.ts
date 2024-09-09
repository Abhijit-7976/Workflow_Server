import { Router } from "express";
import { deleteUser, getAllUsers, getUser } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/", getAllUsers);
router.get("/all", getAllUsers);

router.route("/:id").get(getUser).delete(deleteUser);

export default router;
