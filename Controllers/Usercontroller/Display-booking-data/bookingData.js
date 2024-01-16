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
// .............................................FETCH_ALL_BOOKINGS...................................

export const fetchBookings = async (req, res) => {
  try {
    const bookings = await BookingDB.aggregate([
      {
        $match: {
          userId: { $eq: new ObjectId(req.body.userId) },
        },
      },
      {
        $lookup: {
          from: 'hoteldatas',
          localField: 'hotelId',
          foreignField: '_id',
          as: 'hoteldata',
        },
      },
      { $unwind: '$hoteldata' },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userdata',
        },
      },
      { $unwind: '$userdata' },
      {
        $project: {
          id: 1,
          createdAt: 1,
          bookingId: 1,
          checkInDate: 1,
          checkOutDate: 1,
          singleRoomPrice: 1,
          totalRooms: 1,
          totalStayDays: 1,
          cancelledBy: 1,
          message: 1,
          totalGuest: 1,
          totalPrice: 1,
          paidByCash: 1,
          paidByWallet: 1,
          status: 1,
          hotelname: '$hoteldata.hotelName',
          hotelId: '$hoteldata._id',
          username: '$userdata.name',
          userId: '$userdata._id',
          userEmail: '$userdata.email',
        },
      },
    ]);
    if (bookings) {
      res.status(200).json({ bookings });
    } else {
      res.status(401).json({ message: 'no data found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
