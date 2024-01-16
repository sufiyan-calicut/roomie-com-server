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
// .............................................FETCH_WALLET_HISTORY.......................................

export const fetchWalletHistory = async (req, res) => {
  try {
    const walletData = await WalletDB.aggregate([
      {
        $match: {
          userId: new ObjectId(req.body.userId),
        },
      },
      {
        $unwind: '$transactions',
      },
      {
        $lookup: {
          from: 'hoteldatas',
          localField: 'transactions.hotelId',
          foreignField: '_id',
          as: 'transactions.hotel',
        },
      },
      {
        $lookup: {
          from: 'bookings',
          localField: 'transactions.bookingId',
          foreignField: '_id',
          as: 'transactions.booking',
        },
      },
      {
        $project: {
          _id: 1,
          userId: 1,
          balance: 1,
          transactions: {
            hotel: { $arrayElemAt: ['$transactions.hotel', 0] },
            booking: { $arrayElemAt: ['$transactions.booking', 0] },
            amount: 1,
            description: 1,
            type: 1,
            _id: 1,
          },
          createdAt: 1,
          updatedAt: 1,
          __v: 1,
        },
      },
    ]);

    if (walletData) {
      res.status(200).json(walletData);
    } else {
      res.status(401).json({ message: `you don't have a wallet history` });
    }
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};
