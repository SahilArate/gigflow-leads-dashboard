import { Router } from "express";
import { leadsController } from "./leads.controller";
import { authenticate, authorize, validate } from "../../middleware";
import { createLeadSchema, updateLeadSchema } from "./leads.schema";
import { UserRole } from "../../types";

const router = Router();

router.use(authenticate);

router.get("/stats", leadsController.getLeadStats);
router.get("/export", leadsController.exportCSV);
router.get("/", leadsController.getLeads);
router.get("/:id", leadsController.getLeadById);
router.post("/", validate(createLeadSchema), leadsController.createLead);
router.patch("/:id", validate(updateLeadSchema), leadsController.updateLead);
router.delete("/:id", authorize(UserRole.ADMIN), leadsController.deleteLead);

export default router;