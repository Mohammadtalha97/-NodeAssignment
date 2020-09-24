import express from "express";

import {
  registerController,
  activationController,
  loginController,
  forgotController,
  resetController,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerController);

router.post("/activation", activationController);

router.post("/login", loginController);

router.post("/password/forget", forgotController);

router.post("/password/reset", resetController);

router.post("testing");

export default router;
