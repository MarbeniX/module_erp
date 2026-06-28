import { Router } from "express";
import { changePasswordSchema, loginSchema } from "../schemas/auth.schema";
import { validate } from "../middlewares/validate.middleware";
import { AuthController } from "../controller/auth.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = Router();

router.post("/login", validate(loginSchema), AuthController.login);

router.post(
    "/access-token",
    authenticate("refresh"),
    AuthController.accessToken,
);

router.post(
    "/logoutAll",
    authenticate("access"),
    AuthController.logoutFromAllSessions,
);

router.put(
    "/change-password",
    authenticate("access"),
    validate(changePasswordSchema),
    AuthController.changePassword,
);
