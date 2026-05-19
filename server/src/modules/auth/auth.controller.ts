import { Response } from "express";
import { authService } from "./auth.service";
import { AuthenticatedRequest } from "../../types";
import { ResponseHandler } from "../../utils/response";
import { asyncHandler } from "../../utils/asyncHandler";

export class AuthController {
  // POST /api/auth/register
  register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { user, token } = await authService.register(req.body);

    ResponseHandler.created(res, "Account created successfully", {
      user,
      token,
    });
  });

  // POST /api/auth/login
  login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { user, token } = await authService.login(req.body);

    ResponseHandler.success(res, "Login successful", {
      user,
      token,
    });
  });

  // GET /api/auth/me
  getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await authService.getProfile(req.user!.id);

    ResponseHandler.success(res, "Profile fetched successfully", { user });
  });

  // GET /api/auth/users (admin only)
  getAllUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const users = await authService.getAllUsers();

    ResponseHandler.success(res, "Users fetched successfully", { users });
  });
}

export const authController = new AuthController();