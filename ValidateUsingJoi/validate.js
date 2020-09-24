import Joi from "joi";

//Registration Validation
export const RegistrationValidation = (data) => {
  console.log("registratation validation", data);
  const schema = {
    name: Joi.string().min(5).max(32).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).required(),
  };

  return Joi.validate(data, schema);
};

//Login Validation
export const LoginValidation = (data) => {
  const schema = {
    email: Joi.string().min(5).max(255).email().required(),
    password: Joi.string().min(8).required(),
  };

  return Joi.validate(data, schema);
};

//ForgotPassword Validation
export const ForgotPasswordValidaton = (data) => {
  const schema = {
    email: Joi.string().min(5).max(255).email().required(),
  };
  return Joi.validate(data, schema);
};

//ResetPassword Validation
export const ResetPasswordValidator = (data) => {
  const schema = {
    newPassword: Joi.string().min(8).required(),
  };
  return Joi.validate(data, schema);
};
