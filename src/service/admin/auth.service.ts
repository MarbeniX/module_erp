import bcrypt from "bcrypt";
import {
    ChangeRoleDto,
    EmailDto,
    RegisterDto,
    UserRoleType,
} from "../../schemas/auth.schema";
import { prisma } from "../../lib/prisma";
import { AuthEmail } from "../../emails/admin/auth.email";
import { JWT } from "../../lib/jwt";

export class AuthAdminService {
    static register = async (data: RegisterDto) => {
        const { email, password, name, role } = data;

        const emailExists = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (emailExists) {
            throw {
                status: 409,
                message: "Email already exists",
            };
        }

        const hashedPassword: string = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
                active: true,
            },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
            },
        });

        await AuthEmail.sendConfirmationEmail(
            user.email,
            user.role,
            user.name,
            password,
        );
        return { user };
    };

    static deactivateUser = async (data: EmailDto) => {
        const emailExists = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
            select: {
                active: true,
            },
        });

        if (!emailExists) {
            throw {
                status: 404,
                message: "Email not found",
            };
        }
        if (emailExists.active === false) {
            throw {
                status: 400,
                message: "User is already deactivated",
            };
        }

        const user = await prisma.user.update({
            where: {
                email: data.email,
            },
            data: {
                active: false,
            },
            select: {
                email: true,
                name: true,
            },
        });

        await AuthEmail.sendDeactivationAccountEmail(user.email, user.name);
        return { user };
    };

    static changeRole = async (data: ChangeRoleDto) => {
        const emailExists = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
            select: {
                role: true,
                active: true,
            },
        });

        if (!emailExists) {
            throw {
                status: 404,
                message: "Email not found",
            };
        }
        if (emailExists.active === false) {
            throw {
                status: 400,
                message: "User is deactivated, cannot change role",
            };
        }
        if (emailExists.role === data.role) {
            throw {
                status: 400,
                message: "User already has this role",
            };
        }

        const user = await prisma.user.update({
            where: {
                email: data.email,
            },
            data: {
                role: data.role,
            },
            select: {
                email: true,
                role: true,
                name: true,
            },
        });

        await AuthEmail.sendChangeUserRoleEmail(
            user.email,
            user.role,
            user.name,
        );

        return { user };
    };

    static reactivateUser = async (data: EmailDto) => {
        const emailExists = await prisma.user.findUnique({
            where: {
                email: data.email,
            },
            select: {
                active: true,
            },
        });

        if (!emailExists) {
            throw {
                status: 404,
                message: "Email not found",
            };
        }
        if (emailExists.active === true) {
            throw {
                status: 400,
                message: "User is already active",
            };
        }

        const user = await prisma.user.update({
            where: {
                email: data.email,
            },
            data: {
                active: true,
            },
            select: {
                email: true,
                name: true,
                active: true,
            },
        });

        await AuthEmail.sendReactivationAccountEmail(user.email, user.name);
        return { user };
    };

    static getAllUsers = async () => {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
            },
        });

        return { users };
    };

    static elevated = async (userId: string) => {
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
                role: "admin",
            },
            select: {
                id: true,
                role: true,
            },
        });

        if (!user) {
            throw {
                status: 404,
                message: "User not found or not an admin",
            };
        }

        const elevatedJWT = JWT.generateAccessJWT({
            userId: user.id,
            role: user.role,
            elevated: true,
        });

        return {
            elevatedJWT,
        };
    };
}
