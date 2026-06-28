import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware";
import {
    registerSchema,
    emailSchema,
    changeRoleSchema,
    loginSchema,
} from "../../schemas/auth.schema";
import { authenticate } from "../../middlewares/authenticate.middleware";
import { AuthAdminController } from "../../controller/admin/auth.controller";
import { requireElevated } from "../../middlewares/elevated.middleware";

const router = Router();

router.post("/elevated", authenticate("access"), AuthAdminController.elevated);

router.post(
    "/register-users",
    authenticate("access"),
    requireElevated,
    validate(registerSchema),
    AuthAdminController.registerUser,
);

router.put(
    "/deactivate-user",
    authenticate("access"),
    requireElevated,
    validate(emailSchema),
    AuthAdminController.deactivateUser,
);

router.put(
    "/change-role",
    authenticate("access"),
    requireElevated,
    validate(changeRoleSchema),
    AuthAdminController.changeRole,
);

router.put(
    "/reactivate-user",
    authenticate("access"),
    requireElevated,
    validate(emailSchema),
    AuthAdminController.reactivateUser,
);

router.get("/users", authenticate("refresh"), AuthAdminController.getAllUsers);

export default router;
