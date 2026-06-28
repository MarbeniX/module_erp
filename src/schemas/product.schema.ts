// src/schemas/productSchema.ts
import { z } from "zod";

export const productSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    sku: z.string().optional(),
    unitOfMeasure: z.string().min(1, "Unit of measure is required"),
    unitPrice: z.number().positive("Unit price must be greater than 0"),
    currency: z.string().default("MXN"),
});

export const updateProductSchema = productSchema
    .partial()
    .omit({ supplierId: true });

export const supplierIdSchema = z.object({
    supplierId: z.string().uuid("Invalid supplier ID"),
});

export type CreateProductInput = z.infer<typeof productSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
