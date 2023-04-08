const User = require("../Models/userModel");

const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");

const jwt = require("jsonwebtoken");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  /* eslint-disable */
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// global variables
let otp;

let name;
let email;
let phone;
let password;

module.exports = {
  sendOtp: async (req, res) => {
    try {
      const userExist = await User.findOne({ email: req.body.email });
      if (userExist) {
        return res
          .status(200)
          .send({ message: "user already exist", success: false });
      } else {
        name = req.body.name;
        email = req.body.email;
        phone = req.body.phone;
        password = req.body.password;

        otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        console.log(otp);

        let mailOptions = {
          to: email,
          subject: "One-Time Password (OTP) for Login: ",
          html:
            "<p>Dear user,Your one-time password (OTP) for login is:" +
            "<h1 style='font-weight:bold;'>" +
            otp +
            "</h1>" + // html body
            "<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>",
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error), "otp errorrrrrrrrrr";
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

          setTimeout(function () {
            console.log("Timeout complete.");
            otp = 0;
          }, 60 * 5 * 1000); // 5 minutes in milliseconds

          // res.render("user/otp");
          res
            .status(200)
            .send({ message: "otp send to your email", success: true });
        });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ message: "error on user creation", success: false });
    }
  },

  verifyOtp: async (req, res) => {
    const userOtp = parseInt(req.body.otp);

    if (otp === userOtp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      password = hashedPassword;

      const userData = {
        name,
        email,
        phone,
        password,
      };
      const newUser = new User(userData);
      await newUser.save();
      res
        .status(200)
        .send({ message: "user created successfully", success: true });
    } else {
      res.status(200).send({ message: "password missmatched", success: false });
    }
  },

  doLogin: async (req, res) => {
    try {
      const { email, password } = req.body;

      

      const userExist = await User.findOne({ email });
      if (!userExist) {
        return res
          .status(200)
          .send({ message: "user doesn't exist", success: false });
      }
      if (userExist.block) {
        return res
          .status(200)
          .send({ message: "you are blocked by admin", success: false });
      }

      const isMatch = await bcrypt.compare(password, userExist.password);
      if (!isMatch) {
        return res
          .status(200)
          .send({ message: "incorrect password", success: false });
      } else {
        console.log("token", process.env.JWT_SECRET);

        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        res
          .status(200)
          .send({ message: "Login successfull", success: true, data: token });
      }
    } catch (error) {
      res.status(200).send({ message: "networkerror", success: false });
    }
  },

  resendOtp: async (req, res) => {
    console.log("here");
    try {
      otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);
      console.log(otp);

      if (email) {
        let mailOptions = {
          to: email,
          subject: "One-Time Password (OTP) for Login: ",
          html:
            "<p>Dear user,Your one-time password (OTP) for login is:" +
            "<h1 style='font-weight:bold;'>" +
            otp +
            "</h1>" + // html body
            "<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>",
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error), "otp errorrrrrrrrrr";
          }
          console.log("Message sent: %s", info.messageId);
          console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

          setTimeout(function () {
            otp = 0;
          }, 60 * 5 * 1000); // 5 minutes in milliseconds

          // res.render("user/otp");
          res
            .status(200)
            .send({ message: "otp send to your email", success: true });
        });
      } else {
        res.status(200).send({ message: "unable to send otp", success: false });
      }
    } catch (error) {
      console.error("error");
      return res.status(500).json({ error: "Failed to send email." });
    }
  },

  getUserInfo: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });

      if (!user) {
        return res
          .status(200)
          .send({ message: "user doesn't exist", success: false });
      } else {
        res.status(200).send({
          success: true,
          data: {
            name: user.name,
            email: user.email,
          },
        });
      }
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error getting on user info", success: false });
    }
  },

  checkAuth: async (req, res) => {
    let token = req.headers?.authorization;

    try {
      if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
          if (err) {
            console.log(err);
            res
              .status(200)
              .send({ message: "authentication failed", success: false });
          } else {
            console.log(result.id);

            User.findOne({ _id: result.id }).then((user) => {
              if (user) {
                console.log(user);
                if (!user.block) {
                  res.status(200).json({ authorization: true });
                } else {
                  res.status(401).json({ authorization: false });
                }
              } else {
                res.status(401).json({ authorization: false });
              }
            });
          }
        });
      } else {
        res.status(401).json({ authorization: false });
      }
    } catch (err) {
      res.status(401).json({ authorization: false });
    }
  },
  resetPassword: async (req, res) => {
    try {
      email = req.body.usermail;
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(200)
          .send({ message: "user doesn't exist", success: false });
      }

      // sending otp to user email

      otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);

      console.log(otp);

      let mailOptions = {
        to: email,
        subject: "One-Time Password (OTP) for login: ",
        html:
          "<p>Dear user,Your one-time password (OTP) for login is:" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>" + // html body
          "<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>",
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error), "otp errorrrrrrrrrr";
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        setTimeout(function () {
          console.log("Timeout complete.");
          otp = 0;
        }, 60 * 5 * 1000); // set the time for otp validation ( 5 minute )

        res
          .status(200)
          .send({ message: "otp send to your email", success: true });
      });
    } catch (error) {
      console.error(error);
    }
  },
  verifyResetOtp: async (req, res) => {
    const userotp = parseInt(req.body.userOtp);
    try {
      console.log(typeof otp, typeof userotp);
      if (otp === userotp) {
        return res.status(200).send({ message: "otp verified", success: true });
      } else {
        return res
          .status(200)
          .send({ message: "incorrect otp", success: false });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "someting went wrong", success: false });
    }
  },
  updateNewPassword: async (req, res) => {
    try {
      const password = req.body.password;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.findOne({ email: email });

      user.password = hashedPassword;

      await user
        .save()
        .then(() => {
          res.status(200).send({ message: "password updated", success: true });
        })
        .catch((err) => {
          console.log(err);
          res.status(200).send({ message: "error in updation" });
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "something went wrong" });
    }
  },
};
