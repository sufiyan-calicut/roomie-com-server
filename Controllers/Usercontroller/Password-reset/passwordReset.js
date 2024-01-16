const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../Models/userModel');
const HotelDB = require('../Models/hotelSchema.js');
const Razorpay = require('razorpay');
const BookingDB = require('../Models/bookingSchema');
const WalletDB = require('../Models/wallet');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'Gmail',
  /* eslint-disable */
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// global variables
let otp;
let name;
let place;
let email;
let phone;

// ..............................................PASSWORD_RESET...........................................

export const resetPassword = async (req, res) => {
  try {
    email = req.body.usermail;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "user doesn't exist", success: false });
    }
    otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);

    let mailOptions = {
      to: email,
      subject: 'One-Time Password (OTP) for login: ',
      html:
        '<p>Dear user,Your one-time password (OTP) for login is:' +
        "<h1 style='font-weight:bold;'>" +
        otp +
        '</h1>' +
        '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(401).json({ message: 'unable to send otp' });
      }
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      setTimeout(function () {
        otp = 0;
      }, 60 * 5 * 1000); // set the time for otp validation ( 5 minute )

      res.status(200).json({ message: 'otp send to your email', success: true });
    });
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// ..............................................VERIFY_RESET_OTP.......................................

export const verifyResetOtp = async (req, res) => {
  const userotp = parseInt(req.body.userOtp);
  try {
    if (otp === userotp) {
      return res.status(200).json({ message: 'otp verified', success: true });
    } else {
      return res.status(401).json({ message: 'incorrect otp', success: false });
    }
  } catch (error) {
    res.status(500).json({ message: 'someting went wrong', success: false });
  }
};

// ..............................................UPDATE_PASSWORD......................................

export const updateNewPassword = async (req, res) => {
  try {
    const password = req.body.password;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.findOne({ email: email });

    user.password = hashedPassword;

    await user
      .save()
      .then(() => {
        res.status(200).json({ message: 'password updated', success: true });
      })
      .catch((err) => {
        res.status(401).json({ message: 'error in updation' });
      });
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
};
