import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticatedRequest, IUserPayload } from "../types";
import { ResponseHandler } from "../utils/response";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ResponseHandler.unauthorized(res, "No token provided");
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      ResponseHandler.unauthorized(res, "Invalid token format");
      return;
    }

    const decoded = jwt.verify(token, env.jwt.secret) as IUserPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};