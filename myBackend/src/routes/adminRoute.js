import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import {
  authorizeAdmin,
  authorizeSuperAdmin,
} from "../middlewares/authorize.js";
import {
  deleteUserAsAdmin,
  getAllUser,
  updateRole,
} from "../controllers/adminController.js";

const router = Router();

router.get("/", authenticate, authorizeAdmin, getAllUser);

router.patch(
  "/admin/update/:id/role",
  authenticate,
  authorizeSuperAdmin,
  updateRole,
);

router.delete(
  "/admin/delete/:id",
  authenticate,
  authorizeAdmin,
  deleteUserAsAdmin,
);

export default router;
