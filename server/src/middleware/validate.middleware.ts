import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ResponseHandler } from "../utils/response";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const message = result.error.errors
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join(", ");
        ResponseHandler.badRequest(res, "Validation failed", message);
        return;
      }

      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
};