// src/middlewares/authorize.ts
import { Request, Response, NextFunction } from "express";
import { UserRoleType } from "../schemas/auth.schema";
import { UserRole } from "../schemas/auth.schema";

const ROLE_HIERARCHY: Record<string, UserRoleType[]> = {
    director_only: [UserRole.director, UserRole.admin],
    finance_and_above: [UserRole.finance, UserRole.director, UserRole.admin],
    all_staff: [
        UserRole.purchases,
        UserRole.finance,
        UserRole.director,
        UserRole.admin,
    ],
};

export type AuthorizationLevel = keyof typeof ROLE_HIERARCHY;

export const authorize = (level: AuthorizationLevel) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role as UserRole;

        if (!userRole) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!ROLE_HIERARCHY[level].includes(userRole)) {
            return res
                .status(403)
                .json({ error: "Forbidden: insufficient permissions" });
        }

        next();
    };
};
