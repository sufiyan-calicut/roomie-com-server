const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// ..........................................................ACCEPT_BOOKING.......................

  export const acceptBooking = async (req, res) => {
    try {
      await BookingDB.findByIdAndUpdate({ _id: req.body.bookingId }, { $set: { status: 'accepted' } });
      await BookingDB.find({ hotelId: req.body.hotelId, status: 'pending' }).then((newBookings) => {
        res.status(200).json({ message: 'Booking accepted ', newBookings });
      });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }