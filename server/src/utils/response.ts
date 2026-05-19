import { Response } from "express";
import { ApiResponse, PaginationMeta } from "../types";

export class ResponseHandler {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode = 200,
    meta?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      meta,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(
    res: Response,
    message: string,
    data?: T
  ): Response {
    return this.success(res, message, data, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    error?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: error || message,
    };
    return res.status(statusCode).json(response);
  }

  static unauthorized(res: Response, message = "Unauthorized"): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = "Forbidden"): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = "Resource not found"): Response {
    return this.error(res, message, 404);
  }

  static badRequest(res: Response, message: string, error?: string): Response {
    return this.error(res, message, 400, error);
  }
}