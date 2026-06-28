import { Request, Response, NextFunction } from "express";
import { GenerateAccessTokenPayload, JWT } from "../lib/jwt";

export const requireElevated = (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    const token = req.headers["x-elevated-token"] as string;

    if (!token) {
        return res.status(403).json({ error: "Re-authentication required" });
    }

    try {
        const payload = JWT.verifyJWT(
            token,
            process.env.JWT_TEMPORAL_SECRET!,
        ) as GenerateAccessTokenPayload;

        if (!payload.elevated || payload.role !== "admin") {
            return res.status(403).json({ error: "Insufficient privileges" });
        }

        next();
    } catch {
        return res.status(401).json({ error: "Elevated session expired" });
    }
};
