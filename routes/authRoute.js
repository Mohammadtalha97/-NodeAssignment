import express from "express";

import {
  registerController,
  activationController,
  loginController,
  forgotController,
  resetController,
} from "../controllers/authController.js";

//validation
import {
  validRegister,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../helpers/valid.js";

// import {registerController, } from '../controllers/authController.js';

const router = express.Router();

router.post("/register", validRegister, registerController);

router.post("/activation", activationController);

router.post("/login", validLogin, loginController);

router.post("/password/forget", forgotPasswordValidator, forgotController);

router.post("/password/reset", resetPasswordValidator, resetController);

export default router;

//
