import { Router } from "express";
import { InvoiceController } from "../controller/invoice.controller";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
    changeInvoiceStatusSchema,
    createInvoiceSchema,
    idSchema,
    updateInvoiceSchema,
    validateInvoiceSchema,
} from "../schemas/invoice.schemas";
const router = Router();

router.post(
    "/",
    authenticate("access"),
    authorize("finance_and_above"),
    validate(createInvoiceSchema),
    InvoiceController.createInvoice,
);

router.put(
    "/:id",
    authenticate("access"),
    authorize("finance_and_above"),
    validate(idSchema, "params"),
    validate(updateInvoiceSchema),
    InvoiceController.updateInvoice,
);

router.patch(
    "/:id/validate",
    authenticate("access"),
    authorize("director_only"),
    validate(idSchema, "params"),
    validate(validateInvoiceSchema),
    InvoiceController.validateInvoice,
);

router.patch(
    "/:id/status",
    authenticate("access"),
    authorize("director_only"),
    validate(idSchema, "params"),
    validate(changeInvoiceStatusSchema),
    InvoiceController.changeInvoiceStatus,
);

export default router;
