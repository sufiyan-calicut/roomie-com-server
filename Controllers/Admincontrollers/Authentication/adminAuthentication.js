const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

export const checkAuth = async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const adminToken = authHeader.split(' ')[1];

      if (!adminToken) return res.status(401).json({ authorization: false, message: 'one' });

      const result = await jwt.verify(adminToken, process.env.JWT_SECRET);
      const user = await userModel.findOne({ _id: result.id, userType: 'admin' });

      return res.status(user ? 200 : 401).json({ authorization: Boolean(user), message: 'two' });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  }