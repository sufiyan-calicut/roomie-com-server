const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
  
  // ..........................................................DECLINE_A_BOOKING_REQUEST.......................

export const   declineBooking = async (req, res) => {
    try {
      const date = new Date();
      const actionDate =
        date.toLocaleString('default', { weekday: 'long' }) +
        ' ' +
        date.getDate() +
        ' ' +
        date.toLocaleString('default', { month: 'long' });
      const response = await BookingDB.findByIdAndUpdate(
        { _id: req.body.bookingId },
        { $set: { cancelledBy: 'Hotel', message: req.body.message, status: 'cancelled', actionDate: actionDate } }
      );
      if (response) {
        res.status(200).json({ message: 'booking cancelled' });
      } else {
        res.status(401).json({ message: 'action failed' });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }