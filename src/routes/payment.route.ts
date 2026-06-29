import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { PaymentController } from "../controller/payment.controller";
import { validate } from "../middlewares/validate.middleware";
import {
    createPaymentSchema,
    getPaymentsQuerySchema,
    updatePaymentSchema,
} from "../schemas/payment.schema";
import { idSchema } from "../schemas/invoice.schemas";

const router = Router();

router.get(
    "/",
    authenticate("access"),
    authorize("director_only"),
    validate(getPaymentsQuerySchema, "query"),
    PaymentController.getAllPayments,
);

router.get(
    "/:id",
    authenticate("access"),
    authorize("director_only"),
    validate(idSchema, "params"),
    PaymentController.getPaymentById,
);

router.post(
    "/",
    authenticate("access"),
    authorize("director_only"),
    validate(createPaymentSchema),
    PaymentController.createPayment,
);

router.put(
    "/:id",
    authenticate("access"),
    authorize("director_only"),
    validate(idSchema, "params"),
    validate(updatePaymentSchema),
    PaymentController.updatePayment,
);

export default router;
