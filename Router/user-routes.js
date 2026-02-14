import express from "express";
import { setupSwagger } from "../swagger/swagger.js";
import {
  deleteUser,
  forgotPassword,
  getAllUsers,
  getUser,
  loginUser,
  registerUser,
  resetPassword,
  updateProfile,
  updateUser,
  verifyEmail,
  verifyToken,
} from "../controller/user-ctr.js";
import { validateRegistration } from "../authMiddleware/validation.js";
import { allowRoles, authenticate } from "../authMiddleware/authGuard.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/",authenticate, allowRoles("admin"), getAllUsers)

router.post("/verifyEmail", verifyEmail);
router.post("/verify-token", authenticate, verifyToken);
router.post("/login", loginUser);
router.get("/:id", authenticate, getUser);
router.put("/update/:id", authenticate, updateProfile);
router.delete("/delete/:id", authenticate, deleteUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
