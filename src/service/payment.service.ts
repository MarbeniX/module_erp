import { PaymentEmail } from "../emails/payments.email";
import { prisma } from "../lib/prisma";
import {
    CreatePaymentInput,
    GetPaymentsQuery,
    UpdatePaymentInput,
} from "../schemas/payment.schema";

export class PaymentService {
    private static getOutstandingBalance = async (
        invoiceId: string,
        excludePaymentId?: string,
    ) => {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                payment: true,
            },
        });

        if (!invoice) {
            const error: any = new Error("Invoice not found");
            error.status = 404;
            throw error;
        }

        const payments = await prisma.payment.findMany({
            where: {
                invoiceId,
                ...(excludePaymentId && { NOT: { id: excludePaymentId } }),
            },
        });

        const totalPaid = parseFloat(
            payments.reduce((sum, p) => sum + p.amount, 0).toFixed(2),
        );
        const invoiceTotal = parseFloat(invoice.total.toFixed(2));
        const outstanding = parseFloat((invoiceTotal - totalPaid).toFixed(2));

        return { invoice, totalPaid, invoiceTotal, outstanding, payments };
    };

    private static handleFullyPaid = async (
        invoiceId: string,
        invoiceTotal: number,
        currency: string,
    ) => {
        await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: "paid" },
        });

        const directors = await prisma.user.findMany({
            where: {
                role: { in: ["director", "admin"] },
                active: true,
            },
            select: { email: true, name: true },
        });

        await Promise.all(
            directors.map((director) =>
                PaymentEmail.sendInvoiceFullyPaidEmail(
                    director.email,
                    director.name,
                    invoiceId,
                    invoiceTotal,
                    currency,
                ),
            ),
        );
    };

    static createPayment = async (data: CreatePaymentInput, userId: string) => {
        const { invoice, totalPaid, invoiceTotal, outstanding } =
            await PaymentService.getOutstandingBalance(data.invoiceId);

        if (invoice.status !== "validated") {
            const error: any = new Error(
                "Payments can only be added to validated invoices",
            );
            error.status = 400;
            throw error;
        }

        if (outstanding <= 0) {
            const error: any = new Error(
                "This invoice has already been fully paid",
            );
            error.status = 400;
            throw error;
        }

        const incomingAmount = parseFloat(data.amount.toFixed(2));

        if (incomingAmount > outstanding) {
            const error: any = new Error(
                `Payment amount exceeds outstanding balance. Maximum allowed: ${invoice.currency} ${outstanding.toFixed(2)}`,
            );
            error.status = 400;
            error.detail = {
                invoiceTotal,
                totalPaid,
                outstanding,
                attemptedAmount: incomingAmount,
                currency: invoice.currency,
            };
            throw error;
        }

        const payment = await prisma.payment.create({
            data: {
                invoiceId: data.invoiceId,
                registeredById: userId,
                amount: incomingAmount,
                currency: data.currency,
                paymentDate: new Date(data.paymentDate),
                paymentMethod: data.paymentMethod,
                bankReference: data.bankReference ?? null,
                receiptUrl: data.receiptUrl ?? null,
            },
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        total: true,
                        currency: true,
                        supplier: { select: { id: true, legalName: true } },
                    },
                },
                registeredBy: { select: { id: true, name: true } },
            },
        });

        const newTotalPaid = parseFloat(
            (totalPaid + incomingAmount).toFixed(2),
        );

        if (newTotalPaid >= invoiceTotal) {
            await PaymentService.handleFullyPaid(
                data.invoiceId,
                invoiceTotal,
                invoice.currency,
            );
        }

        return payment;
    };

    static updatePayment = async (id: string, data: UpdatePaymentInput) => {
        const existing = await prisma.payment.findUnique({
            where: { id },
            include: { invoice: true },
        });

        if (!existing) {
            const error: any = new Error("Payment not found");
            error.status = 404;
            throw error;
        }

        if (existing.invoice.status === "paid") {
            const error: any = new Error(
                "Cannot modify a payment from an already paid invoice",
            );
            error.status = 400;
            throw error;
        }

        if (data.amount !== undefined) {
            const { invoiceTotal, outstanding } =
                await PaymentService.getOutstandingBalance(
                    existing.invoiceId,
                    id,
                );

            const incomingAmount = parseFloat(data.amount.toFixed(2));

            if (incomingAmount > outstanding) {
                const error: any = new Error(
                    `Updated amount exceeds outstanding balance. Maximum allowed: ${existing.invoice.currency} ${outstanding.toFixed(2)}`,
                );
                error.status = 400;
                error.detail = {
                    invoiceTotal,
                    outstanding,
                    attemptedAmount: incomingAmount,
                    currency: existing.invoice.currency,
                };
                throw error;
            }
        }

        const payment = await prisma.payment.update({
            where: { id },
            data: {
                ...data,
                paymentDate: data.paymentDate
                    ? new Date(data.paymentDate)
                    : undefined,
            },
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        total: true,
                        currency: true,
                        supplier: { select: { id: true, legalName: true } },
                    },
                },
                registeredBy: { select: { id: true, name: true } },
            },
        });

        // Re-check if now fully paid after update
        const { invoiceTotal, totalPaid } =
            await PaymentService.getOutstandingBalance(existing.invoiceId);

        if (
            parseFloat(totalPaid.toFixed(2)) >=
            parseFloat(invoiceTotal.toFixed(2))
        ) {
            await PaymentService.handleFullyPaid(
                existing.invoiceId,
                invoiceTotal,
                existing.invoice.currency,
            );
        }

        return payment;
    };

    static getAllPayments = async (query: GetPaymentsQuery) => {
        const { invoiceId, limit = 10, offset } = query;

        const where = {
            ...(invoiceId && { invoiceId }),
        };

        const [payments, total] = await prisma.$transaction([
            prisma.payment.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                include: {
                    invoice: {
                        select: {
                            id: true,
                            invoiceNumber: true,
                            total: true,
                            currency: true,
                            status: true,
                            supplier: { select: { id: true, legalName: true } },
                        },
                    },
                    registeredBy: { select: { id: true, name: true } },
                },
            }),
            prisma.payment.count({ where }),
        ]);

        return {
            data: payments,
            total,
            limit,
            offset,
            hasNextPage: offset + limit < total,
        };
    };

    static getPaymentById = async (id: string) => {
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                invoice: {
                    select: {
                        id: true,
                        invoiceNumber: true,
                        total: true,
                        currency: true,
                        status: true,
                        supplier: { select: { id: true, legalName: true } },
                    },
                },
                registeredBy: { select: { id: true, name: true } },
            },
        });

        if (!payment) {
            const error: any = new Error("Payment not found");
            error.status = 404;
            throw error;
        }

        return payment;
    };
}
