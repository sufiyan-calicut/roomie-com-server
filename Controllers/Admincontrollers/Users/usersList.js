const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');


 // ......................................FETCH_ALL_USERS...................................
 export const fetchAllUsers = async (req, res) => {
    try {
      const data = await userModel.find({ userType: 'user' });
      if (!data) {
        return res.status(401).json({ message: 'no users exist', success: false });
      }
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error applying users list', success: false, error });
    }
  }