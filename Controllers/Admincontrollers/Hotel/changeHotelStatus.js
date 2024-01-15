const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');


  // ..............................CHANGE_HOTEL_STATUS..............................................

  export const changeHotelStatus = async (req, res) => {
    try {
      const { hotelID, status } = req.body;
      await HotelDB.findByIdAndUpdate({ _id: hotelID }, { $set: { status: status } });
      const hotels = await HotelDB.find({ status: { $nin: ['Rejected', 'Pending'] } });
      res.status(200).json({ message: 'Status Changed', hotelData: hotels });
    } catch (error) {
      res.status(500).json("Something went wrong, Status didn't Change");
    }
  }