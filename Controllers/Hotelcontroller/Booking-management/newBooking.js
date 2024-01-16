const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// ..........................................................FETCH_NEW_BOOKINGS.......................

export const getNewRequests = async (req, res) => {
  try {
    const newBookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'pending' });
    if (newBookings) {
      res.status(200).json({ newBookings });
    } else {
      return res.status(401).json({ message: 'no new bookings' });
    }
  } catch (error) {
    res.status(500).json({ message: 'something went wrong' });
  }
};
