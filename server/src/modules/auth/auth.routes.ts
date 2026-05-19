import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate, authorize, validate } from "../../middleware";
import { registerSchema, loginSchema } from "./auth.schema";
import { UserRole } from "../../types";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

// Protected routes
router.get("/me", authenticate, authController.getProfile);

// Admin only routes
router.get(
  "/users",
  authenticate,
  authorize(UserRole.ADMIN),
  authController.getAllUsers
);

export default router;