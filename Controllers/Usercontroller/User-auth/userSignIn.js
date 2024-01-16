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
// ..............................................USER_AUTHENTICATION / USER_LOGIN...........................

  export const doLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      const userExist = await User.findOne({ $and: [{ email: email }, { userType: 'user' }] });

      if (!userExist) {
        return res.status(200).json({ message: "user doesn't exist", success: false });
      }
      if (userExist.block) {
        return res.status(200).json({ message: 'you are blocked by admin', success: false });
      }

      const isMatch = await bcrypt.compare(password, userExist.password);
      if (!isMatch) {
        return res.status(200).json({ message: 'incorrect password', success: false });
      } else {
        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });

        res.status(200).json({ message: 'Login successfull', success: true, data: token });
      }
    } catch (error) {
      res.status(500).json({ message: 'networkerror', success: false });
    }
  }