import { prisma } from "../lib/prisma";
import {
    CreateProductInput,
    UpdateProductInput,
} from "../schemas/product.schema";

export class ProductService {
    static createProduct = async (data: CreateProductInput) => {
        const supplier = await prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });

        if (!supplier) {
            const error: any = new Error("Supplier not found");
            error.status = 404;
            throw error;
        }

        if (supplier.status === "inactive") {
            const error: any = new Error(
                "Cannot add products to an inactive supplier",
            );
            error.status = 400;
            throw error;
        }

        if (data.sku) {
            const skuTaken = await prisma.product.findFirst({
                where: {
                    sku: data.sku,
                    supplierId: data.supplierId,
                    isDeleted: false,
                },
            });

            if (skuTaken) {
                const error: any = new Error(
                    "A product with this SKU already exists for this supplier",
                );
                error.status = 409;
                throw error;
            }
        }

        const product = await prisma.product.create({ data });
        return product;
    };

    static updateProduct = async (id: string, data: UpdateProductInput) => {
        const existing = await prisma.product.findFirst({
            where: { id, isDeleted: false },
        });

        if (!existing) {
            const error: any = new Error("Product not found");
            error.status = 404;
            throw error;
        }

        const hasActiveOrderLines = await prisma.orderLine.findFirst({
            where: {
                productId: id,
                order: {
                    status: { in: ["draft", "sent"] },
                },
            },
        });

        if (hasActiveOrderLines) {
            const error: any = new Error(
                "Cannot update a product that is part of an active order",
            );
            error.status = 400;
            throw error;
        }

        if (data.sku && data.sku !== existing.sku) {
            const skuTaken = await prisma.product.findFirst({
                where: {
                    sku: data.sku,
                    supplierId: existing.supplierId,
                    isDeleted: false,
                    NOT: { id },
                },
            });

            if (skuTaken) {
                const error: any = new Error(
                    "A product with this SKU already exists for this supplier",
                );
                error.status = 409;
                throw error;
            }
        }

        const product = await prisma.product.update({
            where: { id },
            data,
        });

        return product;
    };

    static deleteProduct = async (id: string) => {
        const existing = await prisma.product.findFirst({
            where: { id, isDeleted: false },
        });

        if (!existing) {
            const error: any = new Error("Product not found");
            error.status = 404;
            throw error;
        }

        const hasActiveOrderLines = await prisma.orderLine.findFirst({
            where: {
                productId: id,
                order: {
                    status: { in: ["draft", "sent"] },
                },
            },
        });

        if (hasActiveOrderLines) {
            const error: any = new Error(
                "Cannot delete a product that is part of an active order",
            );
            error.status = 400;
            throw error;
        }

        await prisma.product.update({
            where: { id },
            data: { isDeleted: true },
        });

        return { message: "Product deleted successfully" };
    };

    static getAllProducts = async () => {
        const products = await prisma.product.findMany({
            where: { isDeleted: false },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                sku: true,
                unitOfMeasure: true,
                unitPrice: true,
                currency: true,
                updatedAt: true,
                supplier: {
                    select: {
                        id: true,
                        legalName: true,
                    },
                },
            },
        });

        return products;
    };

    static getProductsBySupplier = async (supplierId: string) => {
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
        });

        if (!supplier) {
            const error: any = new Error("Supplier not found");
            error.status = 404;
            throw error;
        }

        const products = await prisma.product.findMany({
            where: { supplierId, isDeleted: false },
            orderBy: { updatedAt: "desc" },
        });

        return products;
    };
}
