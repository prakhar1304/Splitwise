import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  getAllUsers,
  getUserAvatar,
} from "../controller/user.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateUser, logoutUser);
router.get("/me", authenticateUser, getMe);

router.get("/all-users", authenticateUser, getAllUsers);
router.get("/:id/avatar", getUserAvatar);

export default router;
