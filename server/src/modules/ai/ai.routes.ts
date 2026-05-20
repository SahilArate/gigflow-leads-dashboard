import { Router } from "express";
import { aiController } from "./ai.controller";
import { authenticate } from "../../middleware";

const router = Router();

router.use(authenticate);
router.get("/lead/:id", aiController.analyzeLead);
router.get("/insights", aiController.getDashboardInsights);

export default router;