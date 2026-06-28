import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { validate } from "../middlewares/validate.middleware";
import { idSchema, supplierSchema } from "../schemas/supplier.schema";
import { authorize } from "../middlewares/authorize.middleware";
import { SupplierController } from "../controller/supplier.controller";

const router = Router();

router.post(
    "/add-supplier",
    authenticate("access"),
    authorize("all_staff"),
    validate(supplierSchema),
    SupplierController.addSupplier,
);

router.put(
    "/update-supplier/:id",
    authenticate("access"),
    authorize("all-staff"),
    validate(supplierSchema.partial()),
    SupplierController.updateSupplier,
);

router.get(
    "/get-all-suppliers",
    authenticate("access"),
    authorize("all_staff"),
    SupplierController.getAllSuppliers,
);

export default router;
