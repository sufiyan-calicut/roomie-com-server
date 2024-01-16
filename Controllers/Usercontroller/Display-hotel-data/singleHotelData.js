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
// ..........................FETCH_SINGLE_HOTEL_DATA_SELECTED_BY_USER.............

export const fetchSingleHotelData = async (req, res) => {
  try {
    const wallet = await WalletDB.findOne({ userId: req.body.userId }, { balance: 1, _id: 0 });

    await HotelDB.findOne({ _id: req.body.id })
      .then((data) => {
        res.status(200).json({ data: data, wallet });
      })
      .catch((err) => {
        res.status(401).json({ message: `couldn't find data` });
      });
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
};
