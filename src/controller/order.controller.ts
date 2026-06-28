import { Request, Response } from "express";
import { OrderService } from "../service/order.service";
import { GetOrdersQuery, getOrdersQuerySchema } from "../schemas/order.schema";

export class OrderController {
    static createOrder = async (req: Request, res: Response) => {
        try {
            const { userId } = req.user!;
            const order = await OrderService.createOrder(req.body, userId);
            res.status(201).json(order);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static updateOrder = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const order = await OrderService.updateOrder(
                id as string,
                req.body,
            );
            res.status(200).json(order);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static updateOrderStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const order = await OrderService.updateOrderStatus(
                id as string,
                req.body,
            );
            res.status(200).json(order);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getAllOrders = async (req: Request, res: Response) => {
        try {
            const query = req.query as unknown as GetOrdersQuery;
            const result = await OrderService.getAllOrders(query);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
