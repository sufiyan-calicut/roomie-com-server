const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
  
  // ..........................................................FETCH_CANCELLED_BOOKINGS.......................

  export const fetchCancelledBookings = async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'cancelled' });
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no cancelled bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching declined bookings' });
    }
  }