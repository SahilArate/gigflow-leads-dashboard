import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { ResponseHandler } from "../utils/response";
import { env } from "../config/env";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues
      .map((issue) => `${String(issue.path.join("."))}: ${issue.message}`)
      .join(", ");
    ResponseHandler.badRequest(res, "Validation failed", message);
    return;
  }

  // Operational errors (our own AppError)
  if (err instanceof AppError) {
    ResponseHandler.error(res, err.message, err.statusCode);
    return;
  }

  // Mongoose duplicate key error
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    ResponseHandler.badRequest(
      res,
      `${field} already exists`,
      "Duplicate field value"
    );
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    ResponseHandler.badRequest(res, err.message, "Database validation failed");
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    ResponseHandler.unauthorized(res, "Invalid token");
    return;
  }

  if (err.name === "TokenExpiredError") {
    ResponseHandler.unauthorized(res, "Token expired");
    return;
  }

  // Unknown errors
  console.error("❌ Unhandled error:", err);

  ResponseHandler.error(
    res,
    env.nodeEnv === "production" ? "Something went wrong" : err.message,
    500
  );
};