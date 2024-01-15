const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');
  
  // ......................................ACCEPT_HOTEL_REQUEST..............................................

  export const acceptHotelRequest = async (req, res) => {
    try {
      const hotelID = req.body.hotelID;
      const hotel = await HotelDB.findOne({ _id: hotelID });

      hotel.status = 'Active';
      hotel.message = `We are pleased to inform you that your account has been successfully activated. We are committed to
      providing you with a seamless booking experience, and we are confident that our partnership will result in
      increased bookings for your hotel.`;

      await hotel.save().then(async () => {
        const newHotels = await HotelDB.find({ status: 'Pending' });
        res.status(200).json({ message: 'Accepted', newHotels });
      });
    } catch (error) {
      res.status(500).json({ message: 'failed , check after sometime' });
    }
  }