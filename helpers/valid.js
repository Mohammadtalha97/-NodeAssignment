// // import Joi from 'joi';

// // //Registration Validation
// // export const validRegister = (data) =>
// // {
// //     const schema =  {
// //         name : Joi.string().min(4).max(32).required(),
// //         email : Joi.string().min(5).max(255).required().email(),
// //         password : Joi.string().min(6).max(500).required()
// //     }
// //     return Joi.validate(data, schema);
// // }

// // //loginValidation Validation
// // export const validLogin = (data) =>
// // {
// //     const schema =  {
// //         email : Joi.string().min(5).max(255).required().email(),
// //         password : Joi.string().min(6).max(500).required()
// //     }

// //     return Joi.validate(data, schema);
// // }

// // export const forgotPasswordValidator = (data) => {
// //     const schema  = {
// //         email : Joi.string().required().email()
// //     }
// // }

// // export const resetPasswordValidator = (data) => {
// //     const schema = {
// //         password : Joi.string.min(6).required()
// //     }
// // }

// import expressValidator from "express-validator";
// const { check, oneOf, validationResult } = expressValidator;

// export const validRegister = [
//   check("name", "Name is required")
//     .notEmpty()
//     .isLength({
//       min: 4,
//       max: 32,
//     })
//     .withMessage("name must be between 3 to 32 characters"),
//   check("email").isEmail().withMessage("Must be a valid email address"),
//   check("password", "password is required").notEmpty(),
//   check("password")
//     .isLength({
//       min: 6,
//     })
//     .withMessage("Password must contain at least 6 characters")
//     .matches(/\d/)
//     .withMessage("password must contain a number"),
// ];
// console.log("registerValidation");

// // Login
// export const validLogin = [
//   check("email").isEmail().withMessage("Must be a valid email address"),
//   check("password", "password is required").notEmpty(),
//   check("password")
//     .isLength({
//       min: 6,
//     })
//     .withMessage("Password must contain at least 6 characters")
//     .matches(/\d/)
//     .withMessage("password must contain a number"),
// ];

// //Forgot Password
// export const forgotPasswordValidator = [
//   check("email")
//     .not()
//     .isEmpty()
//     .isEmail()
//     .withMessage("Must be a valid email address"),
// ];

// //ResetPassword
// export const resetPasswordValidator = [
//   check("newPassword")
//     .not()
//     .isEmpty()
//     .isLength({ min: 6 })
//     .withMessage("Password must be at least  6 characters long"),
// ];
