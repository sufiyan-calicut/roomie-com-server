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
// .............................................CANCEL_BOOKING.......................................

export const cancellBooking = async (req, res) => {
  try {
    const { bookingData, userId } = req.body;

    const booking = await BookingDB.findOneAndUpdate(
      { _id: bookingData.booking._id },
      { $set: { message: bookingData.reasonText, cancelledBy: 'customer', status: 'cancelled' } }
    );
    const transactions = [
      {
        hotelId: booking.hotelId,
        bookingId: booking._id,
        amount: booking.totalPrice,
        description: bookingData.reasonText,
        type: 'credit',
      },
    ];
    let wallet = await WalletDB.findOne({ userId: req.body.userId });

    if (wallet) {
      wallet.transactions.push(...transactions);
      wallet.balance = wallet.balance + booking.totalPrice;
    } else {
      wallet = new WalletDB({ userId, balance: booking.totalPrice, transactions });
    }

    await wallet.save();

    const singleBooking = await BookingDB.aggregate([
      {
        $match: {
          _id: { $eq: new ObjectId(booking._id) },
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
          status: 1,
          hotelname: '$hoteldata.hotelName',
          hotelId: '$hoteldata._id',
          username: '$userdata.name',
          userId: '$userdata._id',
          userEmail: '$userdata.email',
        },
      },
    ]);

    res.json({ message: 'Booking cancelled successfully', data: singleBooking[0] });
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};
