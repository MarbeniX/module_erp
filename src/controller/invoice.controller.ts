// src/controllers/invoiceController.ts
import { Request, Response } from "express";
import { InvoiceService } from "../service/invoice.service";

export class InvoiceController {
    static createInvoice = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!;
            const invoice = await InvoiceService.createInvoice(
                req.body,
                userId as string,
            );
            res.status(201).json(invoice);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static updateInvoice = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const invoice = await InvoiceService.updateInvoice(
                id as string,
                req.body,
            );
            res.status(200).json(invoice);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static validateInvoice = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { userId } = req.user!;
            const invoice = await InvoiceService.validateInvoice(
                id as string,
                userId as string,
            );
            res.status(200).json(invoice);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static changeInvoiceStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const invoice = await InvoiceService.changeInvoiceStatus(
                id as string,
                req.body,
            );
            res.status(200).json(invoice);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
