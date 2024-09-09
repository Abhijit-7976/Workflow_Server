import { Router } from "express";
import { getAllWorkflow, runWorkflow, saveWorkflow, startWorkflow } from "../controllers/workflow.controller.js";
import { isAuth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Protect all routes after this middlewares
router.use(isAuth);

router.get("/", getAllWorkflow);
router.post("/save", saveWorkflow);
router.post("/start", upload.single("csvFile"), startWorkflow);
router.get("/run/:flowId", runWorkflow);

export default router;
