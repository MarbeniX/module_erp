// src/controllers/paymentController.ts
import { Request, Response } from "express";
import { PaymentService } from "../service/payment.service";
import {
    GetPaymentsQuery,
    getPaymentsQuerySchema,
} from "../schemas/payment.schema";
export class PaymentController {
    static createPayment = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!;
            const payment = await PaymentService.createPayment(
                req.body,
                userId as string,
            );
            res.status(201).json(payment);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
                ...(error.detail && { detail: error.detail }),
            });
        }
    };

    static updatePayment = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const payment = await PaymentService.updatePayment(
                id as string,
                req.body,
            );
            res.status(200).json(payment);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
                ...(error.detail && { detail: error.detail }),
            });
        }
    };

    static getAllPayments = async (req: Request, res: Response) => {
        try {
            const query = req.query as unknown as GetPaymentsQuery;
            const result = await PaymentService.getAllPayments(query);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getPaymentById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const payment = await PaymentService.getPaymentById(id as string);
            res.status(200).json(payment);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
