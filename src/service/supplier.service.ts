import { prisma } from "../lib/prisma";
import { SupplierDto, UpdateSupplierDto } from "../schemas/supplier.schema";

export class SupplierService {
    static addSupplier = async (data: SupplierDto) => {
        const existing = await prisma.supplier.findUnique({
            where: { taxId: data.taxId },
        });

        if (existing) {
            const error: any = new Error(
                "A supplier with this tax ID already exists",
            );
            error.status = 409;
            throw error;
        }

        const supplier = await prisma.supplier.create({ data });
        return supplier;
    };

    static updateSupplier = async (id: string, data: UpdateSupplierDto) => {
        const existing = await prisma.supplier.findUnique({
            where: { id, status: "active" },
        });

        if (!existing) {
            const error: any = new Error("Supplier not found");
            error.status = 404;
            throw error;
        }

        if (data.taxId && data.taxId !== existing.taxId) {
            const taxIdTaken = await prisma.supplier.findUnique({
                where: { taxId: data.taxId },
            });
            if (taxIdTaken) {
                const error: any = new Error(
                    "Tax ID is already in use by another supplier",
                );
                error.status = 409;
                throw error;
            }
        }

        const supplier = await prisma.supplier.update({
            where: { id },
            data,
        });

        return supplier;
    };

    static getAllSuppliers = async () => {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                legalName: true,
                taxId: true,
                contactEmail: true,
                phone: true,
                bankAccount: true,
                currency: true,
                status: true,
                createdAt: true,
            },
        });

        return suppliers;
    };
}
