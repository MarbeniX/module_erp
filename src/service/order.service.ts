import { prisma } from "../lib/prisma";
import {
    CreateOrderInput,
    GetOrdersQuery,
    UpdateOrderInput,
    UpdateOrderStatusInput,
} from "../schemas/order.schema";

const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ["sent", "cancelled"],
    sent: ["received", "cancelled"],
    received: [],
    cancelled: [],
};

const generateOrderNumber = async (): Promise<string> => {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
    const lastOrder = await prisma.order.findFirst({
        where: { orderNumber: { startsWith: prefix } },
        orderBy: { orderNumber: "desc" },
    });

    const sequence = lastOrder
        ? parseInt(lastOrder.orderNumber.split("-")[2]) + 1
        : 1;

    return `${prefix}-${String(sequence).padStart(4, "0")}`;
};

const calculateTotals = (lines: { quantity: number; unitPrice: number }[]) => {
    const subtotal = lines.reduce(
        (sum, line) => sum + line.quantity * line.unitPrice,
        0,
    );
    const taxes = parseFloat((subtotal * 0.16).toFixed(2));
    const total = parseFloat((subtotal + taxes).toFixed(2));
    return { subtotal: parseFloat(subtotal.toFixed(2)), taxes, total };
};

export class OrderService {
    static createOrder = async (data: CreateOrderInput, userId: string) => {
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
                "Cannot create an order for an inactive supplier",
            );
            error.status = 400;
            throw error;
        }

        const productIds = data.lines.map((l) => l.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, isDeleted: false },
        });

        if (products.length !== productIds.length) {
            const error: any = new Error(
                "One or more products not found or have been deleted",
            );
            error.status = 404;
            throw error;
        }

        const wrongSupplier = products.filter(
            (p) => p.supplierId !== data.supplierId,
        );
        if (wrongSupplier.length > 0) {
            const error: any = new Error(
                "All products must belong to the selected supplier",
            );
            error.status = 400;
            throw error;
        }

        const { subtotal, taxes, total } = calculateTotals(data.lines);
        const orderNumber = await generateOrderNumber();

        const order = await prisma.order.create({
            data: {
                supplierId: data.supplierId,
                userId,
                orderNumber,
                expectedDelivery: data.expectedDelivery
                    ? new Date(data.expectedDelivery)
                    : null,
                currency: data.currency,
                notes: data.notes,
                subtotal,
                taxes,
                total,
                lines: {
                    create: data.lines.map((line) => ({
                        productId: line.productId,
                        quantity: line.quantity,
                        unitPrice: line.unitPrice,
                        subtotal: parseFloat(
                            (line.quantity * line.unitPrice).toFixed(2),
                        ),
                    })),
                },
            },
            include: {
                lines: { include: { product: true } },
                supplier: { select: { id: true, legalName: true } },
                user: { select: { id: true, name: true } },
            },
        });

        return order;
    };

    static updateOrder = async (id: string, data: UpdateOrderInput) => {
        const existing = await prisma.order.findUnique({ where: { id } });

        if (!existing) {
            const error: any = new Error("Order not found");
            error.status = 404;
            throw error;
        }

        if (existing.status !== "draft") {
            const error: any = new Error(
                "Only orders in draft status can be edited",
            );
            error.status = 400;
            throw error;
        }

        let totals = {};

        if (data.lines && data.lines.length > 0) {
            const productIds = data.lines.map((l) => l.productId);
            const products = await prisma.product.findMany({
                where: { id: { in: productIds }, isDeleted: false },
            });

            if (products.length !== productIds.length) {
                const error: any = new Error(
                    "One or more products not found or have been deleted",
                );
                error.status = 404;
                throw error;
            }

            const wrongSupplier = products.filter(
                (p) => p.supplierId !== existing.supplierId,
            );
            if (wrongSupplier.length > 0) {
                const error: any = new Error(
                    "All products must belong to the original supplier",
                );
                error.status = 400;
                throw error;
            }

            totals = calculateTotals(data.lines);

            await prisma.orderLine.deleteMany({ where: { orderId: id } });
        }

        const order = await prisma.order.update({
            where: { id },
            data: {
                expectedDelivery: data.expectedDelivery
                    ? new Date(data.expectedDelivery)
                    : undefined,
                notes: data.notes,
                currency: data.currency,
                ...totals,
                ...(data.lines && {
                    lines: {
                        create: data.lines.map((line) => ({
                            productId: line.productId,
                            quantity: line.quantity,
                            unitPrice: line.unitPrice,
                            subtotal: parseFloat(
                                (line.quantity * line.unitPrice).toFixed(2),
                            ),
                        })),
                    },
                }),
            },
            include: {
                lines: { include: { product: true } },
                supplier: { select: { id: true, legalName: true } },
                user: { select: { id: true, name: true } },
            },
        });

        return order;
    };

    static updateOrderStatus = async (
        id: string,
        data: UpdateOrderStatusInput,
    ) => {
        const existing = await prisma.order.findUnique({ where: { id } });

        if (!existing) {
            const error: any = new Error("Order not found");
            error.status = 404;
            throw error;
        }

        const allowed = VALID_TRANSITIONS[existing.status];
        if (!allowed.includes(data.status)) {
            const error: any = new Error(
                `Cannot transition from "${existing.status}" to "${data.status}"`,
            );
            error.status = 400;
            throw error;
        }

        const order = await prisma.order.update({
            where: { id },
            data: { status: data.status },
            include: {
                supplier: { select: { id: true, legalName: true } },
                user: { select: { id: true, name: true } },
            },
        });

        return order;
    };

    static getAllOrders = async (query: GetOrdersQuery) => {
        const { status, limit, offset } = query;

        const where = {
            ...(status && { status }),
        };

        const [orders, total] = await prisma.$transaction([
            prisma.order.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset,
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    total: true,
                    currency: true,
                    issuedAt: true,
                    expectedDelivery: true,
                    createdAt: true,
                    supplier: { select: { id: true, legalName: true } },
                    user: { select: { id: true, name: true } },
                    _count: { select: { lines: true } },
                },
            }),
            prisma.order.count({ where }),
        ]);

        return {
            data: orders,
            total,
            limit,
            offset,
            hasNextPage: offset + limit < total,
        };
    };
}
