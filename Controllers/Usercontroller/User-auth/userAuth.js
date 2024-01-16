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

  // .............................................USER_AUTH_FOR_COMPONENT_RENDER...............................

  export const checkAuth = async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const token = authHeader.split(' ')[1];

      if (!token) return res.status(401).json({ authorization: false });

      const result = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ $and: [{ _id: result.id, userType: 'user' }] });
      return res.status(user ? 200 : 401).json({ authorization: Boolean(user) });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  }