const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
 
 // ..........................................................HOTEL_AUTHENTICATION.......................

 export const hotelAuth = async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const hotelToken = authHeader.split(' ')[1];

      if (!hotelToken) return res.status(401).json({ authorization: false });

      const result = await jwt.verify(hotelToken, process.env.JWT_SECRET);
      const hotel = await HotelDB.findOne({ _id: result.id });
      if (hotel.status == 'pending' || hotel.status == 'block') {
        return res.status(401).json({ autherization: false });
      }

      return res.status(hotel ? 200 : 401).json({ authorization: Boolean(hotel) });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  }