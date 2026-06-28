import { AuthEmail } from "../emails/auth.email";
import { GenerateAccessTokenPayload, JWT } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import {
    ChangePasswordDto,
    LoginDto,
    UserRoleType,
} from "../schemas/auth.schema";
import bcrypt from "bcrypt";

export class AuthService {
    static login = async (data: LoginDto, deviceInfo: string) => {
        const { email, password } = data;
        const emailExists = await prisma.user.findUnique({
            where: { email, active: true, role: "admin" },
            select: { password: true, id: true, role: true },
        });

        if (!emailExists) {
            throw {
                status: 404,
                message: "Email not found or user is not active/admin",
            };
        }

        const passwordMatch = await bcrypt.compare(
            password,
            emailExists.password,
        );
        if (!passwordMatch) {
            throw {
                status: 401,
                message: "Invalid password",
            };
        }

        const refreshToken = JWT.generateRefreshJWT(emailExists.id);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: emailExists.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deviceInfo: deviceInfo,
            },
        });

        const accessToken = JWT.generateAccessJWT({
            userId: emailExists.id,
            role: emailExists.role,
        } as GenerateAccessTokenPayload);

        return {
            refreshToken,
            accessToken,
        };
    };

    static accessToken = async (userId: string, role: UserRoleType) => {
        const accessToken = JWT.generateAccessJWT({
            userId,
            role,
        } as GenerateAccessTokenPayload);
        return {
            accessToken,
        };
    };

    static logoutFromAllSessions = async (userId: string) => {
        await prisma.refreshToken.deleteMany({
            where: { userId },
        });
    };

    static changePassword = async (
        data: ChangePasswordDto,
        userId: string,
        deviceInfo: string,
    ) => {
        const { oldPassword, password } = data;

        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                active: true,
            },
            select: {
                password: true,
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        if (!user) {
            throw {
                status: 404,
                message: "User not found or inactive",
            };
        }

        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            throw {
                status: 401,
                message: "Old password is incorrect",
            };
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        await prisma.refreshToken.deleteMany({
            where: { userId },
        });

        const refreshToken = JWT.generateRefreshJWT(user.id);
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                deviceInfo: deviceInfo,
            },
        });

        const accessToken = JWT.generateAccessJWT({
            userId: user.id,
            role: user.role,
        } as GenerateAccessTokenPayload);

        await AuthEmail.sendChangePasswordEmail(user.email, user.name);

        return {
            refreshToken,
            accessToken,
        };
    };
}
