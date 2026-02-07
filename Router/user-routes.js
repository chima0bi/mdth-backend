import express from "express";
import {
  deleteUser,
  getUser,
  loginUser,
  registerUser,
  updateProfile,
  updateUser,
  verifyEmail,
  verifyToken,
} from "../controller/user-ctr.js";
import { validateRegistration } from "../authMiddleware/validation.js";
import { authenticate } from "../authMiddleware/authGuard.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/verifyEmail", verifyEmail);
router.post("/verify-token", authenticate, verifyToken);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.put("/update/:id", updateProfile);
router.delete("/delete/:id", deleteUser);

export default router;
