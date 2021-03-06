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

import pkg from "googleapis";

const { google } = pkg;

export const registerController = (req, res) => {
  const { name, email, password } = req.body;
  //OAuth
  const OAuth2 = google.auth.OAuth2;

  const myOAuth2Client = new OAuth2(
    "253200379199-7mpgtomrjebru2sb557omskerpss7lf0.apps.googleusercontent.com",
    "A52xCTOlmTDDzPw949-2I8_I",
    "https://developers.google.com/oauthplayground"
  );

  myOAuth2Client.setCredentials({
    refresh_token:
      "1//04JNs-6gwTeoICgYIARAAGAQSNwF-L9IrrQPcEuVi4YMNDBfJvTxRK8DnUSdk6689WxLultBtEoBtDiRNUtP42fkNDOtYZnNKh00",
  });

  const myAccessToken = myOAuth2Client.getAccessToken();

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

    //email data sending || for port: 465 secure=true

    var transport = nodemailer.createTransport({
      // service: "gmail",
      // host: process.env.SMTP_HOST,
      // port: process.env.SMTP_PORT,
      // secure: process.env.SMTP_SECURE,
      // host: "smtp.gmail.com",
      host: process.env.SMTP_HOST,
      // port: 25,
      // secure: false,
      // logger: true,
      // debug: true,
      // ignoreTLS: true, // add this
      // requireTLS: process.env.REQUIRE_TLS,
      // name: process.env.NAME_FOR_EMAIL,
      auth: {
        type: process.env.OAUTH_TYPE,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_CLIENT_REFERSH_TOKEN,
        accessToken: myAccessToken, //access token variable we defined earlier
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
                    <p>${process.env.HOSTED_URL}/users/activate/${token}</p>
                    <hr />
                    <p>This email may containe sensetive information</p>
                    <p>${process.env.HOSTED_URL}</p>
                `,
    };

    console.log("mail data ------->", mailOptions);

    transport.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("errorMail--------->", error);
        return res.json({ error: error });
        // res.sendStatus(500);
        // return res.status(400).json({ message: "Error While Sending Mail" });
      } else {
        // transport.close();
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

        console.log("above bcrypt");
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(user.hashed_password, salt, (err, hash) => {
            if (err) {
              console.log("increpet_error-------->", err);
              res.status(400);
            } else {
              console.log("inside hash --> else");
              user.hashed_password = hash;

              console.log("user_data-------->", user);
              user.save((err, user) => {
                console.log("inside save method--->");
                if (err) {
                  console.log("err");
                  return res.status(401).json({
                    error: errorHandler(err),
                  });
                }
                console.log("success");

                return res.json({
                  success: true,
                  message: "Signup Success",
                });
                // res.end();
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

  //oAuth2
  const OAuth2 = google.auth.OAuth2;

  const myOAuth2Client = new OAuth2(
    "253200379199-7mpgtomrjebru2sb557omskerpss7lf0.apps.googleusercontent.com",
    "A52xCTOlmTDDzPw949-2I8_I",
    "https://developers.google.com/oauthplayground"
  );

  myOAuth2Client.setCredentials({
    refresh_token:
      "1//04JNs-6gwTeoICgYIARAAGAQSNwF-L9IrrQPcEuVi4YMNDBfJvTxRK8DnUSdk6689WxLultBtEoBtDiRNUtP42fkNDOtYZnNKh00",
  });

  const myAccessToken = myOAuth2Client.getAccessToken();

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
        // host: "smtp.gmail.com",
        host: process.env.SMTP_HOST,
        // auth: {
        //   // type: "OAuth2",
        //   user: "patel.glsica15@gmail.com",
        //   pass: "#SalamYaNabi@123",
        // },
        auth: {
          type: process.env.OAUTH_TYPE,
          clientId: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_CLIENT_REFERSH_TOKEN,
          accessToken: myAccessToken, //access token variable we defined earlier
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });

      var mailOptions = {
        from: "patel.glsica15@gmail.com",
        to: req.body.email,
        subject: "Password Reset link",
        html: `
                      <h1>Please use the following to reset your password</h1>
                      <p>${process.env.HOSTED_URL}/users/password/reset/${token}</p>
                      <hr />
                      <p>This email may containe sensetive information</p>
                      <p>${process.env.HOSTED_URL}</p>
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
                res.json({ error: error });
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
    // logger: false,
    // newline: "windows",
    // sendmail: true,
    // port : 25,
    // port: 587,
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

//middleware for sending space to client every 15 second
export const extendTimeoutMiddleware = (req, res, next) => {
  console.log("inside middleware");
  const space = " ";
  let isFinished = false;
  let isDataSent = false;

  console.log("response sent --->", res.headersSent);

  res.once("finish", () => {
    console.log("inside finish");
    isFinished = true;
  });

  res.once("end", () => {
    console.log("inside end");
    isFinished = true;
  });

  res.once("close", () => {
    console.log("inside close");
    isFinished = true;
  });

  res.on("data", (data) => {
    console.log("inside data");
    // Look for something other than our blank space to indicate that real
    // data is now being sent back to the client.
    if (data !== space) {
      isDataSent = true;
    }
  });

  const waitAndSend = () => {
    setTimeout(() => {
      console.log("inside settimeout");
      // If the response hasn't finished and hasn't sent any data back....
      if (!isFinished && !isDataSent) {
        console.log("inside settimeout if");
        // Need to write the status code/headers if they haven't been sent yet.
        if (!res.headersSent) {
          console.log("inside settimeout if-if");
          res.writeHead(202);
        }

        res.write(space);

        // Wait another 15 seconds
        waitAndSend();
      }
    }, 15000);
  };

  console.log("last");
  waitAndSend();
  next();
};
