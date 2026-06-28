import { z } from "zod";

export const supplierSchema = z.object({
    legalName: z.string().min(1, "Legal name is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    contactEmail: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Phone number is required"),
    bankName: z.string().min(1, "Bank name is required"),
    accountNumber: z
        .string()
        .min(18, "CLABE must be 18 digits")
        .max(18, "CLABE must be 18 digits"),
    currency: z.enum(["MXN", "USD", "EUR"], "Invalid currency"),
    status: z.enum(["active", "inactive"], "Invalid status"),
});

export const updateSupplierSchema = supplierSchema.partial();

export const idSchema = z.object({
    id: z.string().uuid("Invalid UUID format"),
});

export type SupplierDto = z.infer<typeof supplierSchema>;
export type UpdateSupplierDto = z.infer<typeof updateSupplierSchema>;
export type IdDto = z.infer<typeof idSchema>;
