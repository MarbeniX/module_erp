import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.middleware";
import { validate } from "../middlewares/validate.middleware";
import { supplierSchema } from "../schemas/supplier.schema";

const router = Router();

router.post("/add-supplier", authenticate("access"), validate(supplierSchema));
