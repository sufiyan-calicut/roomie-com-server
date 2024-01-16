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

export const fetchProfileData = async (req, res) => {
    try {
      const data = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(req.body.userId),
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'userId',
            as: 'walletData',
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            phone: 1,
            walletBalance: {
              $ifNull: [{ $arrayElemAt: ['$walletData.balance', 0] }, 'No Wallet'],
            },
          },
        },
      ]);

      if (!data) {
        return res.status(401).json({ message: 'unable to fetch user details' });
      } else {
        res.status(200).json(data[0]);
      }
    } catch (error) {
      res.status(500).send({ message: 'internal server error!' });
    }
  }