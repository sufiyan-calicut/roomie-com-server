const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');  
  
  // ..........................................................HOTEL_LOGIN.......................

  export const doLogin = async (req, res) => {
    try {
      const email = req.body.email;
      const hotelID = req.body.hotelID;
      const hotel = await HotelDB.findOne({ $and: [{ email: email }, { hotelId: hotelID }] });

      if (!hotel) {
        return res.status(401).json({ message: 'no hotel found' });
      } else if (hotel.status == 'blocked') {
        return res.status(403).json({ message: 'your account is blocked by admin' });
      } else {
        const hotelToken = jwt.sign({ id: hotel._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });
        res.status(200).json({ message: 'login Successfull', hotelToken, hotelId: hotel._id });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  }