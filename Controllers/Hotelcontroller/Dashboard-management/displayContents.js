const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
  
  // ..........................................................FETCH_HOTEL_DATA.......................
  export const fetchHotelData = async (req, res) => {
    try {
      const response = await HotelDB.findById(req.body.hotelId);
      if (response) {
        res.status(200).json({ data: response });
      } else {
        res.status(401).json({ message: 'error on fetching hotel data' });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }