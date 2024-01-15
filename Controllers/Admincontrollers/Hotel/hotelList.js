const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

  // .........................................DISPLAY_ALL_AVAILABLE_HOTELS..............................................

  getHotelsData: async (req, res) => {
    try {
      const hotels = await HotelDB.find();
      res.status(200).json({ hotelData: hotels });
    } catch (error) {
      res.status(500).json({ message: 'No Hotel Exists' });
    }
  }