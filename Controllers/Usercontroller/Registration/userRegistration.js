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
let password;

// .............................................SEND_OTP_AFTER_REGISTRAION..................................

export const sendOtp = async (req, res) => {
  try {
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(200).json({ message: 'user already exist', success: false });
    } else {
      name = req.body.name;
      place = req.body.place;
      email = req.body.email;
      phone = req.body.phone;
      password = req.body.password;

      otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);

      let mailOptions = {
        to: email,
        subject: 'One-Time Password (OTP) for Login: ',
        html:
          '<p>Dear user,Your one-time password (OTP) for login is:' +
          "<h1 style='font-weight:bold;'>" +
          otp +
          '</h1>' + // html body
          '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('no issue', info);
          // Check if the info object is not undefined before accessing its properties
          if (info && info.messageId) {
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
          } else {
            console.log('Email sent, but message ID not available in the info object.');
          }
          res.status(200).json({ message: 'otp send to your email', success: true });
        }

        setTimeout(function () {
          otp = 0;
        }, 60 * 5 * 1000); // 5 minutes in milliseconds
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'error on user creation', success: false });
  }
};

// ..............................................VERIFY_OTP_ENTERED_BY_USER.................................

export const verifyOtp = async (req, res) => {
  try {
    const userOtp = parseInt(req.body.otp);
    if (otp === userOtp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const userData = {
        name,
        place,
        email,
        phone,
        password: hashedPassword,
      };

      const newUser = new User(userData);
      const userdb = await newUser.save();

      const userdbId = userdb._id.toString();
      const wallet = new WalletDB({ userId: userdbId });
      await wallet.save();

      console.log('User created successfully');
      res.status(200).json({ message: 'User created successfully', success: true });
    } else {
      res.status(403).json({ message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resendOtp = async (req, res) => {
  try {
    otp = Math.random();
    otp = otp * 1000000;
    otp = parseInt(otp);

    if (email) {
      let mailOptions = {
        to: email,
        subject: 'One-Time Password (OTP) for Login: ',
        html:
          '<p>Dear user,Your one-time password (OTP) for login is:' +
          "<h1 style='font-weight:bold;'>" +
          otp +
          '</h1>' +
          '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          // Check if the info object is not undefined before accessing its properties
          if (info && info.messageId) {
            console.log('Message sent: %s', info.messageId);
          } else {
            console.log('Email sent, but message ID not available in the info object.');
          }
        }

        setTimeout(function () {
          otp = 0;
        }, 60 * 5 * 1000); // 5 minutes in milliseconds

        res.status(200).json({ message: 'otp send to your email', success: true });
      });
    } else {
      res.status(401).json({ message: 'unable to send otp', success: false });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email.' });
  }
}