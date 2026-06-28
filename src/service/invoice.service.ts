import { prisma } from "../lib/prisma";
import {
    CreateInvoiceInput,
    UpdateInvoiceInput,
    ValidateInvoiceInput,
    ChangeInvoiceStatusInput,
} from "../schemas/invoice.schemas";

const DIRECTOR_ALLOWED_STATUSES = ["rejected", "paid"];

const LOCKED_STATUSES = ["validated", "rejected", "paid"];

export class InvoiceService {
    static createInvoice = async (data: CreateInvoiceInput, userId: string) => {
        const supplier = await prisma.supplier.findUnique({
            where: { id: data.supplierId },
        });

        if (!supplier) {
            const error: any = new Error("Supplier not found");
            error.status = 404;
            throw error;
        }

        if (data.orderId) {
            const order = await prisma.order.findUnique({
                where: { id: data.orderId },
            });

            if (!order) {
                const error: any = new Error("Order not found");
                error.status = 404;
                throw error;
            }

            if (order.status !== "received") {
                const error: any = new Error(
                    "Invoice can only be linked to an order marked as received",
                );
                error.status = 400;
                throw error;
            }

            if (order.supplierId !== data.supplierId) {
                const error: any = new Error(
                    "Order does not belong to the selected supplier",
                );
                error.status = 400;
                throw error;
            }

            const existingInvoice = await prisma.invoice.findUnique({
                where: { orderId: data.orderId },
            });

            if (existingInvoice) {
                const error: any = new Error(
                    "This order already has an invoice linked",
                );
                error.status = 409;
                throw error;
            }
        }

        const duplicateNumber = await prisma.invoice.findUnique({
            where: { invoiceNumber: data.invoiceNumber },
        });

        if (duplicateNumber) {
            const error: any = new Error(
                "An invoice with this number already exists",
            );
            error.status = 409;
            throw error;
        }

        const invoice = await prisma.invoice.create({
            data: {
                supplierId: data.supplierId,
                orderId: data.orderId ?? null,
                capturedById: userId,
                invoiceNumber: data.invoiceNumber,
                issuedAt: new Date(data.issuedAt),
                dueDate: new Date(data.dueDate),
                subtotal: data.subtotal,
                taxes: data.taxes,
                total: data.total,
                currency: data.currency,
                fileUrl: data.fileUrl ?? null,
                status: "captured",
            },
            include: {
                supplier: { select: { id: true, legalName: true } },
                capturedBy: { select: { id: true, name: true } },
                order: { select: { id: true, orderNumber: true } },
            },
        });

        return invoice;
    };

    static updateInvoice = async (id: string, data: UpdateInvoiceInput) => {
        const existing = await prisma.invoice.findUnique({ where: { id } });

        if (!existing) {
            const error: any = new Error("Invoice not found");
            error.status = 404;
            throw error;
        }

        if (LOCKED_STATUSES.includes(existing.status)) {
            const error: any = new Error(
                `Invoice cannot be edited in "${existing.status}" status`,
            );
            error.status = 400;
            throw error;
        }

        if (
            data.invoiceNumber &&
            data.invoiceNumber !== existing.invoiceNumber
        ) {
            const duplicate = await prisma.invoice.findUnique({
                where: { invoiceNumber: data.invoiceNumber },
            });

            if (duplicate) {
                const error: any = new Error(
                    "An invoice with this number already exists",
                );
                error.status = 409;
                throw error;
            }
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                ...data,
                issuedAt: data.issuedAt ? new Date(data.issuedAt) : undefined,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            },
            include: {
                supplier: { select: { id: true, legalName: true } },
                capturedBy: { select: { id: true, name: true } },
                order: { select: { id: true, orderNumber: true } },
            },
        });

        return invoice;
    };

    static validateInvoice = async (id: string, validatedById: string) => {
        const existing = await prisma.invoice.findUnique({
            where: { id },
            include: { order: true },
        });

        if (!existing) {
            const error: any = new Error("Invoice not found");
            error.status = 404;
            throw error;
        }

        if (existing.status !== "captured") {
            const error: any = new Error(
                "Only invoices in captured status can be validated",
            );
            error.status = 400;
            throw error;
        }

        if (existing.order && existing.order.status !== "received") {
            const error: any = new Error(
                "The linked order is no longer in received status",
            );
            error.status = 400;
            throw error;
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: "validated",
                validatedById,
                validatedAt: new Date(),
            },
            include: {
                supplier: { select: { id: true, legalName: true } },
                capturedBy: { select: { id: true, name: true } },
                validatedBy: { select: { id: true, name: true } },
                order: { select: { id: true, orderNumber: true } },
            },
        });

        return invoice;
    };

    static changeInvoiceStatus = async (
        id: string,
        data: ChangeInvoiceStatusInput,
    ) => {
        const existing = await prisma.invoice.findUnique({ where: { id } });

        if (!existing) {
            const error: any = new Error("Invoice not found");
            error.status = 404;
            throw error;
        }

        if (data.status === "paid" && existing.status !== "validated") {
            const error: any = new Error(
                "Invoice must be validated before it can be marked as paid",
            );
            error.status = 400;
            throw error;
        }

        if (
            data.status === "rejected" &&
            !["captured", "validated"].includes(existing.status)
        ) {
            const error: any = new Error(
                `Cannot reject an invoice in "${existing.status}" status`,
            );
            error.status = 400;
            throw error;
        }

        const invoice = await prisma.invoice.update({
            where: { id },
            data: {
                status: data.status,
            },
            include: {
                supplier: { select: { id: true, legalName: true } },
                capturedBy: { select: { id: true, name: true } },
                validatedBy: { select: { id: true, name: true } },
                order: { select: { id: true, orderNumber: true } },
            },
        });

        return invoice;
    };
}
