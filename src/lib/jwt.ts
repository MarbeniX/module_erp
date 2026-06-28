import jwt from "jsonwebtoken";
import { UserRole, UserRoleType } from "../schemas/auth.schema";

export interface GenerateAccessTokenPayload {
    userId: string;
    role: UserRoleType;
    elevated?: boolean;
}

export class JWT {
    static generateAdminTempJWT = (paylaod: GenerateAccessTokenPayload) => {
        return jwt.sign(
            {
                userId: paylaod.userId,
                role: paylaod.role,
                elevated: paylaod.elevated,
            },
            process.env.JWT_TEMPORAL_SECRET!,
            {
                expiresIn: "5m",
            },
        );
    };

    static generateAccessJWT = (payload: GenerateAccessTokenPayload) => {
        return jwt.sign(
            {
                userId: payload.userId,
                role: payload.role,
            },
            process.env.JWT_ACCESS_SECRET!,
            {
                expiresIn: "15m",
            },
        );
    };

    static generateRefreshJWT = (userId: string) => {
        return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, {
            expiresIn: "30d",
        });
    };

    static verifyJWT = (token: string, secret: string) => {
        return jwt.verify(token, secret);
    };
}
