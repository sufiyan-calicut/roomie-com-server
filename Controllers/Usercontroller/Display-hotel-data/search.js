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
  // .............................................FETCH_SEARCH_DATA.....................................

  export const fetchSearchData = async (req, res) => {
    try {
      const skip = req.body.hotelData.length;
      const location = req.body.location.trim();
      const userInput = {
        $or: [
          { hotelName: { $regex: new RegExp(location, 'i') } },
          { place: { $regex: new RegExp(location, 'i') } },
          { city: { $regex: new RegExp(location, 'i') } },
          { state: { $regex: new RegExp(location, 'i') } },
        ],
        amnities: req.body.amnities == null || req.body.amnities?.length == 0 ? null : { $all: [...req.body.amnities] },
        availableRooms: req.body.roomCounts ? { $gte: req.body.roomCounts } : null,
        price: req.body.price ? { $gte: 1000 } : null,
        status: 'Active',
      };

      const queryConditions = {};
      for (const key in userInput) {
        if (userInput[key] !== null) {
          queryConditions[key] = userInput[key];
        }
      }
      const count = await HotelDB.countDocuments(queryConditions);

      let isDataOver = Boolean(count <= skip + 6);
      await HotelDB.find(queryConditions)
        .sort({ price: req.body.sort })
        .limit(6 + skip)
        .then((data) => {
          res.status(200).json({ data, isDataOver });
        })
        .catch((error) => {
          res.status(401).json({ message: 'error on fetching data from db' });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }