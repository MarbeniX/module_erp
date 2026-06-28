import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

type RequestField = "body" | "query" | "params";

export const validate =
    (schema: ZodSchema, field: RequestField = "body") =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[field]);

        if (!result.success) {
            res.status(400).json({
                errors: result.error.flatten().fieldErrors,
                formErrors: result.error.flatten().formErrors,
            });
            return;
        }

        if (field === "query") {
            Object.assign(req.query, result.data);
        } else {
            req[field] = result.data;
        }
        next();
    };
