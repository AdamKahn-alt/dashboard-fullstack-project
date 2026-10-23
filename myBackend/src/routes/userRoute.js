import { Router } from "express";
import {
  createUser,
  deleteUserById,
  forgotPassword,
  getUserById,
  // getUserByName,
  loginUser,
  logoutUser,
  resetPassword,
  updateUserById,
} from "../controllers/userController.js";
import { authenticate } from "../middlewares/authenticate.js";
import {
  // authorizeAdmin,
  authorizeEachUser,
  // authorizeSuperAdmin,
} from "../middlewares/authorize.js";

const router = Router();

router.get("/user/id/:id", authenticate, authorizeEachUser, getUserById);

router.post("/login", loginUser);
router.post("/signup", createUser);
router.post("/user/logout", logoutUser);
router.post("/user/forgot-password", forgotPassword);
router.post("/user/reset-password", resetPassword);
router.patch(
  "/user/update/:id",
  authenticate,
  authorizeEachUser,
  updateUserById,
);
router.delete(
  "/user/delete/:id",
  authenticate,
  authorizeEachUser,
  deleteUserById,
);

export default router;

//future plan
// route first, then authenticate, then authorize, then controller

// router.route("/update").patch(updateUserByName)
// createUser, loginUser, getAllUsers, getUserByName, UpdateUserById, updateUserByName, deleteUser
