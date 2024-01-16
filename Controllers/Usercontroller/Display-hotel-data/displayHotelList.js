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
  // .............................................FETCHING_ALL_ROOMS....................................

  export const displayRooms = async (req, res) => {
    try {
      await HotelDB.find()
        .limit(20)
        .then((hotels) => {
          res.status(200).json(hotels);
        })
        .catch((error) => {
          res.status(401).json({ message: `couldn't fetch the data` });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }