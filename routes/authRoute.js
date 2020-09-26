import express from "express";

import {
  registerController,
  activationController,
  loginController,
  forgotController,
  resetController,
  testing,
  extendTimeoutMiddleware,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/activation", extendTimeoutMiddleware, activationController);

router.post("/login", loginController);

router.post("/password/forget", forgotController);

router.post("/password/reset", resetController);

router.post("/testing", testing);

export default router;
