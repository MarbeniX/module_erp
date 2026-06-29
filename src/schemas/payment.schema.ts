import { z } from "zod";

export const createPaymentSchema = z.object({
    invoiceId: z.string().uuid("Invalid invoice ID"),
    amount: z.number().positive("Amount must be greater than 0"),
    currency: z.string().default("MXN"),
    paymentDate: z.string().datetime("Invalid payment date"),
    paymentMethod: z.enum(["transfer", "check", "cash"]),
    bankReference: z.string().optional(),
    receiptUrl: z.string().url("Invalid receipt URL").optional(),
});

export const updatePaymentSchema = z.object({
    amount: z.number().positive().optional(),
    currency: z.string().optional(),
    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.enum(["transfer", "check", "cash"]).optional(),
    bankReference: z.string().optional(),
    receiptUrl: z.string().url("Invalid receipt URL").optional(),
});

export const getPaymentsQuerySchema = z.object({
    invoiceId: z.string().uuid().optional(),
    limit: z.coerce.number().int().positive().default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type GetPaymentsQuery = z.infer<typeof getPaymentsQuerySchema>;
