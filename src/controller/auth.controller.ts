import { Request, Response } from "express";
import { AuthService } from "../service/auth.service";

export class AuthController {
    static login = async (req: Request, res: Response) => {
        try {
            const deviceInfo = req.headers["user-agent"];
            const { refreshToken, accessToken } = await AuthService.login(
                req.body,
                deviceInfo,
            );
            res.status(201).json({
                refreshToken,
                accessToken,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static accessToken = async (req: Request, res: Response) => {
        try {
            const { userId, role } = req.user!;
            const { accessToken } = await AuthService.accessToken(userId, role);
            res.status(201).json(accessToken);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static logoutFromAllSessions = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!;
            await AuthService.logoutFromAllSessions(userId);
            res.status(201).json();
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static changePassword = async (req: Request, res: Response) => {
        try {
            const deviceInfo = req.headers["user-agent"];
            const { userId } = req.user!;
            const { refreshToken, accessToken } =
                await AuthService.changePassword(req.body, userId, deviceInfo);
            res.status(201).json({
                refreshToken,
                accessToken,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
