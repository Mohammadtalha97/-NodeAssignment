import User from "../models/authModel.js";
// import _, { result } from "lodash";
// import _, { result } from "lodash";
import bcrypt from "bcryptjs";
import _ from "lodash";
import jwt from "jsonwebtoken";
import errorHandler from "../helpers/dbErrorHandaling.js";
import nodemailer from "nodemailer";
import {
  RegistrationValidation,
  LoginValidation,
  ForgotPasswordValidaton,
  ResetPasswordValidator,
} from "../ValidateUsingJoi/validate.js";
import e from "express";

export const registerController = (req, res) => {
  const { name, email, password } = req.body;

  console.log("data are coming --------->", req.body);

  const { error } = RegistrationValidation(req.body);

  if (error) {
    console.log("error");
    let errorMessage = error.details[0].message;
    return res.status(400).json({ error: errorMessage });
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
      // service: "gmail",
      host: "smtp.gmail.com",
      // port: 465,
      // port : 25,
      // port: 587,
      secure: false,
      // debug: true,
      // logger: true,
      // secure: false,
      // ignoreTLS: false,

      auth: {
        user: process.env.MY_EMAIL,
        pass: process.env.MY_PASSWORD,
      },
    });

    var mailOptions = {
      from: process.env.MY_EMAIL,
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
        res.json({ error: "mail not send" });
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
export const activationController = async (req, res) => {
  console.log("auth called..........");
  // console.log("req.body --->", req.body)
  const { token } = req.body;

  console.log("token");
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

        // let saltRounds = 10;

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.hashed_password, salt, (err, hash) => {
            if (err) {
              console.log("increpet_error-------->", err);
              res.status(400);
            } else {
              user.hashed_password = hash;
              user.save((err, user) => {
                if (err) {
                  console.log("err");
                  return res.status(401).json({
                    error: errorHandler(err),
                  });
                } else {
                  console.log("success");
                  return res.json({
                    success: true,
                    message: "Signup Success",
                  });
                }
              });
            }
          });
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

  const { error } = LoginValidation(req.body);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    //check if user exist
    User.findOne({ email }).exec((err, user) => {
      if (err || !user) {
        return res.status(400).json({
          error: " User With That Email Does Not Exist, Please Sign Up",
        });
      }

      bcrypt.compare(password, user.hashed_password, (err, result) => {
        if (err) {
          console.log("error", err);
        } else {
          if (!result) {
            return res.status(400).json({
              error: "Email And Password Do Not Match",
            });
          } else {
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
          }
        }
      });
    });
  }
};

//forgot_password
export const forgotController = (req, res) => {
  console.log("inside forgot--------->");

  const { error } = ForgotPasswordValidaton(req.body);

  let { email } = req.body;
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    console.log("working");
    //Find if user exists
    User.findOne({ email }).exec((err, user) => {
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
        // service: "gmail",
        host: "smtp.gmail.com",
        auth: {
          // type: "OAuth2",
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
  let newPasswordObj = {
    newPassword: newPassword,
  };
  const { error } = ResetPasswordValidator(newPasswordObj);

  console.log("error", error);
  if (error) {
    res.status(400).json({ error: error.details[0].message });
  } else {
    console.log("3", resetPasswordLink);
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

              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(updatedFields.password, salt, (err, hash) => {
                  if (err) {
                    console.log("increpet_error-------->", err);
                    res.status(400);
                  } else {
                    // updatedFields.password = hash;
                    return user.updateOne(
                      {
                        hashed_password: hash,
                      },
                      (err, success) => {
                        if (err) {
                          return res
                            .status(400)
                            .json({ error: errorHandler(err) });
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
                                message:
                                  "Great! Now you can login with new password",
                              });
                            }
                          });
                        }
                      }
                    );
                  }
                });
              });
            }
          });
        }
      });
    } else {
      console.log("not inside 4");
    }
  }
};

export const testing = (req, res) => {
  var transport = nodemailer.createTransport({
    host: "smtp.gmail.com",

    secure: true,

    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.MY_EMAIL,
    to: "mohammadtalha.patel@thegatewaycorp.com",
    subject: "Account activation link",
    html: `
                  <h1>Please use the following to activate your account</h1>
                  <p>${process.env.CLIENT_URL}/users/activate/</p>
                  <hr />
                  <p>This email may containe sensetive information</p>
                  <p>${process.env.CLIENT_URL}</p>
              `,
  };

  console.log("mail data ------->", mailOptions);

  transport.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("errorMail--------->", error);
      res.json({ error: "mail not send" });
      res.sendStatus(500);
      return res.status(400).send({ message: "Error While Sending Mail" });
    } else {
      console.log("Message sent: " + info.response);
      return res.status(200).send({ message: "Mail Send To Given Mail ID" });
    }
  });
};
