import { z } from "zod";

export const orderLineSchema = z.object({
    productId: z.string().uuid("Invalid product ID"),
    quantity: z.number().int().positive("Quantity must be greater than 0"),
    unitPrice: z.number().positive("Unit price must be greater than 0"),
});

export const createOrderSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
    expectedDelivery: z.string().datetime().optional(),
    currency: z.string().default("MXN"),
    notes: z.string().optional(),
    lines: z
        .array(orderLineSchema)
        .min(1, "Order must have at least one product"),
});

export const updateOrderSchema = z.object({
    expectedDelivery: z.string().datetime().optional(),
    notes: z.string().optional(),
    currency: z.string().optional(),
    lines: z.array(orderLineSchema).min(1).optional(),
});

export const updateOrderStatusSchema = z.object({
    status: z.enum(["draft", "sent", "received", "cancelled"]),
});

export const getOrdersQuerySchema = z.object({
    status: z.enum(["draft", "sent", "received", "cancelled"]).optional(),
    limit: z.coerce.number().int().positive().default(20),
    offset: z.coerce.number().int().min(0).default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
