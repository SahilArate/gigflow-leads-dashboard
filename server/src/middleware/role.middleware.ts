import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "../types";
import { ResponseHandler } from "../utils/response";

export const authorize = (...roles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      ResponseHandler.unauthorized(res, "Not authenticated");
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      ResponseHandler.forbidden(
        res,
        "You do not have permission to perform this action"
      );
      return;
    }

    next();
  };
};