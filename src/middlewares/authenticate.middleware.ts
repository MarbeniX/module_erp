import { Request, Response, NextFunction } from "express";
import { GenerateAccessTokenPayload, JWT } from "../lib/jwt";
import { UserRole, UserRoleType } from "../schemas/auth.schema";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: UserRoleType;
            };
        }
    }
}

type TokenType = "refresh" | "access";

const secrets: Record<TokenType, string> = {
    refresh: process.env.JWT_REFRESH_SECRET!,
    access: process.env.JWT_ACCESS_SECRET!,
};

export const authenticate =
    (type: TokenType) => (req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            res.status(401).json({ message: "No token provided" });
            return;
        }
        const token = authHeader.split(" ")[1];
        try {
            const payload = JWT.verifyJWT(token, secrets[type]);
            req.user = payload as GenerateAccessTokenPayload;
            next();
        } catch {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    };
