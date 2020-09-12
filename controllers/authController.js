import User from "../models/authModel.js";
import expressJwt from "express-jwt";
// import _ from 'loadash';
import pkgGoogle from "google-auth-library";
import fetch from "node-fetch";
// const _ = require("lodash");
import _ from "lodash";
import pkgExpressValidator from "express-validator";
import jwt from "jsonwebtoken";
// import { } from '../models/authModel';
// custom error handler to get useful error from database errors
import errorHandler from "../helpers/dbErrorHandaling.js";

import nodemailer from "nodemailer";
// import { func } from "joi";

const { OAuth2Client } = pkgGoogle;
const { validationResult } = pkgExpressValidator;

export const registerController = (req, res) => {
  const { name, email, password } = req.body;

  console.log("data are coming --------->", req.body);
  const errors = validationResult(req);

  //custome validation

  if (!errors.isEmpty()) {
    console.log(" errors -->", errors);

    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    console.log("no errors");
    User.findOne({
      email,
    }).exec((err, user) => {
      if (user) {
        return res.status(400).json({
          error: "Email Is Taken",
        });
      }
    });

    //generat token

    const token = jwt.sign(
      {
        name,
        email,
        password,
      },
      process.env.JWT_ACCOUNT_ACTIVATION,
      {
        expiresIn: "55m",
      }
    );

    //email data sending

    var transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "patel.glsica15@gmail.com",
        pass: "#SalamYaNabi@123",
      },
    });

    var mailOptions = {
      from: "patel.glsica15@gmail.com",
      to: req.body.email,
      subject: "Account activation link",
      html: `
                    <h1>Please use the following to activate your account</h1>
                    <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
                    <hr />
                    <p>This email may containe sensetive information</p>
                    <p>${process.env.CLIENT_URL}</p>
                `,
    };

    console.log("mail data ------->", mailOptions);

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("errorMail--------->", error);
        res.json({ yo: "error" });
        res.sendStatus(500);
        return res.status(400).send({ message: "Error While Sending Mail" });
      } else {
        console.log("Message sent: " + info.response);
        return res.status(200).send({ message: "Mail Send To Given Mail ID" });
      }
    });
  }
};

//activation and save into database

export const activationController = (req, res) => {
  console.log("auth called..........");
  // console.log("req.body --->", req.body)
  const { token } = req.body;

  console.log("token", token);
  if (token) {
    //verifing token
    jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decoded) => {
      if (err) {
        console.log("token error");
        return res.status(401).json({
          error: "Expired Token Signup Again",
        });
      } else {
        console.log("token success");
        //if valid save to database
        //get name email password from token

        const { name, email, password } = jwt.decode(token);

        const user = new User({
          name: name,
          email: email,
          hashed_password: password,
        });

        user.save((err, user) => {
          if (err) {
            return res.status(401).json({
              error: errorHandler(err),
            });
          } else {
            return res.json({
              success: true,
              message: "Signup Success",
            });
          }
        });
      }
    });
  } else {
    console.log("else");
    return res.json({
      message: "Error Happening Please Try Again",
    });
  }
};

//Login
export const loginController = (req, res) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    //check if user exist
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: " User With That Email Does Not Exist, Please Sign Up",
        });
      }

      if (password !== user.hashed_password) {
        return res.status(400).json({
          error: "Email And Password Do Not Match",
        });
      }

      //Generate token

      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      const { _id, name, email, role } = user;
      return res.json({
        token,
        user: {
          _id,
          name,
          email,
          role,
        },
      });
    });
  }
};

//forgot_password
export const forgotController = (req, res) => {
  console.log("inside forgot--------->");
  const { email } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    //Find if user exists
    User.findOne({ email }, (err, user) => {
      if (err || !user) {
        return res
          .status(400)
          .json({ error: "User With That Email Dose Not Exist" });
      }

      //If Exists
      //Generate token for user with this id valid for 10 minites
      const token = jwt.sign(
        {
          _id: user._id,
        },
        process.env.JWT_RESET_PASSWORD,
        { expiresIn: "40m" }
      );

      //Send email with this token
      var transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "patel.glsica15@gmail.com",
          pass: "#SalamYaNabi@123",
        },
      });

      var mailOptions = {
        from: "patel.glsica15@gmail.com",
        to: req.body.email,
        subject: "Password Reset link",
        html: `
                      <h1>Please use the following to reset your password</h1>
                      <p>${process.env.CLIENT_URL}/users/password/reset/${token}</p>
                      <hr />
                      <p>This email may containe sensetive information</p>
                      <p>${process.env.CLIENT_URL}</p>
                  `,
      };

      return user.updateOne(
        {
          resetPasswordLink: token,
        },
        (err, success) => {
          if (err) {
            return res.status(400).json({ error: errorHandler(err) });
          } else {
            //send mail
            transport.sendMail(mailOptions, function (error, info) {
              if (error) {
                res.json({ error: "error" });
                res.sendStatus(500);
                return res
                  .status(400)
                  .send({ message: "Error While Sending Mail" });
              } else {
                console.log("Message sent: " + info.response);
                return res
                  .status(200)
                  .send({ message: "Mail Send To Given Mail ID" });
              }
            });
          }
        }
      );
    });
  }
};

//reset_password
export const resetController = (req, res) => {
  console.log("1");
  const { resetPasswordLink, newPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("2");
    const firstError = errors.array().map((error) => error.msg)[0];
    return res.status(422).json({
      error: firstError,
    });
  } else {
    console.log("3");
    if (resetPasswordLink) {
      console.log("4");

      jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD, function (
        err,
        decoded
      ) {
        if (err) {
          console.log("5");
          return res.status(400).json({
            error: "Expired Link, Try Again",
          });
        } else {
          console.log("6");
          User.findOne({ resetPasswordLink }, (err, user) => {
            console.log("7");
            if (err || !user) {
              console.log("8");
              return res.status(400).json({
                error: "Something went wrong. Try Later",
              });
            } else {
              console.log("9");
              const updatedFields = {
                password: newPassword,
                resetPasswordLink: "",
              };

              return user.updateOne(
                {
                  hashed_password: updatedFields.password,
                },
                (err, success) => {
                  if (err) {
                    return res.status(400).json({ error: errorHandler(err) });
                  } else {
                    user.save((err, result) => {
                      if (err) {
                        console.log("10");
                        return res.status(400).json({
                          error: "Error reseting user password",
                        });
                      } else {
                        console.log("11");
                        res.json({
                          message: "Great! Now you can login with new password",
                        });
                      }
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  }
};
