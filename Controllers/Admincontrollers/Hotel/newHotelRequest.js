const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

export const newHotelRequests = async (req, res) => {
    try {
      const newHotels = await HotelDB.find({ status: 'Pending' });
      if (!newHotels) {
        return res.status(404).json();
      }
      res.status(200).json(newHotels);
    } catch (error) {
      res.status(500).send({ message: 'internal server error' });
    }
  }

//   export newHotelRequests;