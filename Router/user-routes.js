import express from "express";
import { deleteUser, getUser, loginUser, registerUser, updateProfile, updateUser } from "../controller/user-ctr.js";
import { validateRegistration } from "../authMiddleware/validation.js";

const router = express.Router();

router.post("/register", validateRegistration, registerUser);
router.post("/login", loginUser);
router.get("/:id", getUser);
router.put("/update/:id", updateProfile);
router.delete("/delete/:id", deleteUser);

export default router