import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { ProductController } from "../controller/product.controller";
import { validate } from "../middlewares/validate.middleware";
import { productSchema, updateProductSchema } from "../schemas/product.schema";
import { idSchema } from "../schemas/invoice.schemas";

const router = Router();

router.get(
    "/",
    authenticate("access"),
    authorize("all_staff"),
    ProductController.getAllProducts,
);

router.post(
    "/",
    authenticate("access"),
    authorize("all_staff"),
    validate(productSchema),
    ProductController.createProduct,
);

router.put(
    "/:id",
    authenticate("access"),
    authorize("all_staff"),
    validate(idSchema, "params"),
    validate(updateProductSchema),
    ProductController.updateProduct,
);

router.delete(
    "/:id",
    authenticate("access"),
    authorize("director_only"),
    validate(idSchema, "params"),
    ProductController.deleteProduct,
);

export default router;
