// src/routes/orderRoutes.ts
import { Router } from "express";
import {
    createOrderSchema,
    updateOrderSchema,
    updateOrderStatusSchema,
    getOrdersQuerySchema,
} from "../schemas/order.schema";
import { OrderController } from "../controller/order.controller";
import { authorize } from "../middlewares/authorize.middleware";
import { authenticate } from "../middlewares/authenticate.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idSchema } from "../schemas/invoice.schemas";

const router = Router();

router.get(
    "/",
    authenticate("access"),
    authorize("all_staff"),
    validate(getOrdersQuerySchema, "query"),
    OrderController.getAllOrders,
);

router.post(
    "/",
    authenticate("access"),
    authorize("all_staff"),
    validate(createOrderSchema),
    OrderController.createOrder,
);

router.put(
    "/:id",
    authenticate("access"),
    authorize("all_staff"),
    validate(idSchema, "params"),
    validate(updateOrderSchema),
    OrderController.updateOrder,
);

router.patch(
    "/:id/status",
    authenticate("access"),
    authorize("all_staff"),
    validate(idSchema, "params"),
    validate(updateOrderStatusSchema),
    OrderController.updateOrderStatus,
);

export default router;
