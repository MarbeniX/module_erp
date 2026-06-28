import { z } from "zod";

export enum UserRole {
    PURCHASES = "purchases",
    FINANCE = "finance",
    DIRECTOR = "director",
    admin = "admin",
}

const password = z.object({
    password: z
        .string()
        .min(5, "Password must be at least 5 characters")
        .regex(
            /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/,
            "Password must contain at least one uppercase letter, one number, and one special character",
        ),
    confirmPassword: z.string(),
});

const registerBaseSchema = password.extend({
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    role: z.enum(["admin", "purchases", "finance", "director"]),
});

export const registerSchema = registerBaseSchema.refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    },
);

export const emailSchema = registerBaseSchema.pick({
    email: true,
});

export const loginSchema = password
    .pick({
        password: true,
    })
    .extend({
        email: z.string().email("Invalid email address"),
    });

export const changeRoleSchema = registerBaseSchema.pick({
    email: true,
    role: true,
});

export const changePasswordSchema = password.extend({
    oldPassword: z.string().min(1, "Latest password is required"),
});

export type RegisterDto = z.infer<typeof registerBaseSchema>;
export type EmailDto = z.infer<typeof emailSchema>;
export type ChangeRoleDto = z.infer<typeof changeRoleSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type UserRoleType = z.infer<typeof UserRole>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
