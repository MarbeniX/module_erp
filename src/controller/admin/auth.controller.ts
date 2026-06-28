import { Request, Response } from "express";
import { AuthAdminService } from "../../service/admin/auth.service";

export class AuthAdminController {
    static registerUser = async (req: Request, res: Response) => {
        try {
            const { user } = await AuthAdminService.register(req.body);
            res.status(201).json({
                message: "User registered successfully",
                data: user,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static deactivateUser = async (req: Request, res: Response) => {
        try {
            const { user } = await AuthAdminService.deactivateUser(req.body);
            res.status(201).json({
                message: "User deactivated successfully",
                data: user,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static changeRole = async (req: Request, res: Response) => {
        try {
            const { user } = await AuthAdminService.changeRole(req.body);
            res.status(201).json({
                message: "User role changed successfully",
                data: user,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static reactivateUser = async (req: Request, res: Response) => {
        try {
            const { user } = await AuthAdminService.reactivateUser(req.body);
            res.status(201).json({
                message: "User reactivated successfully",
                data: user,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getAllUsers = async (res: Response) => {
        try {
            const { users } = await AuthAdminService.getAllUsers();
            res.status(201).json({
                data: users,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static elevated = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!;
            const { elevatedJWT } = await AuthAdminService.elevated(userId);
            res.status(201).json({
                message: "User role changed successfully",
                elevatedJWT,
            });
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
