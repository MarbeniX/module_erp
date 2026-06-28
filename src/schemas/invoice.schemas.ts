import { z } from "zod";

export const createInvoiceSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
    orderId: z.string().uuid("Invalid order ID").optional(),
    invoiceNumber: z
        .string()
        .min(1, "Invoice number is required")
        .regex(
            /^INV-\d{4}-\d{6}$/,
            "Invoice number must follow the format INV-YYYY-XXXXXX (e.g. INV-2025-000001)",
        ),
    issuedAt: z.string().datetime("Invalid issued date"),
    dueDate: z.string().datetime("Invalid due date"),
    subtotal: z.number().positive("Subtotal must be greater than 0"),
    taxes: z.number().min(0, "Taxes cannot be negative"),
    total: z.number().positive("Total must be greater than 0"),
    currency: z.string().default("MXN"),
    fileUrl: z.string().url("Invalid file URL").optional(),
});

export const updateInvoiceSchema = z.object({
    invoiceNumber: z
        .string()
        .regex(
            /^INV-\d{4}-\d{6}$/,
            "Invoice number must follow the format INV-YYYY-XXXXXX",
        )
        .optional(),
    issuedAt: z.string().datetime().optional(),
    dueDate: z.string().datetime().optional(),
    subtotal: z.number().positive().optional(),
    taxes: z.number().min(0).optional(),
    total: z.number().positive().optional(),
    currency: z.string().optional(),
    fileUrl: z.string().url("Invalid file URL").optional(),
});

export const validateInvoiceSchema = z
    .object({
        status: z.enum(["validated"]),
    })
    .refine((data) => data.status !== "validated", {
        message: "Validation reason is required when validating an invoice",
    });

export const changeInvoiceStatusSchema = z
    .object({
        status: z.enum(["rejected", "paid"]),
    })
    .refine((data) => data.status !== "rejected", {
        message: "Rejection reason is required when rejecting an invoice",
        path: ["rejectionReason"],
    });

export const idSchema = z.object({
    id: z.string().uuid("Invalid ID"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type ValidateInvoiceInput = z.infer<typeof validateInvoiceSchema>;
export type ChangeInvoiceStatusInput = z.infer<
    typeof changeInvoiceStatusSchema
>;
