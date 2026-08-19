import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
} from "../controllers/auth.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Public
router.post("/signup", signup);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected
router.post("/logout", verifyJWT, logout);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-profile", verifyJWT, updateProfile);
router.patch("/change-password", verifyJWT, changePassword);
router.delete("/delete-account", verifyJWT, deleteAccount);

export default router;
