const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

  // ..........................DECLINE_HOTEL_REQUEST..............................................


export const declineHotelRequest = async (req, res) => {
  try {
    const hotelID = req.body.hotelID;
    await HotelDB.updateOne({ _id: hotelID }, { $set: { status: 'Rejected', message: req.body.cancelReason } }).then(
      async () => {
        const newHotels = await HotelDB.find({ status: 'Pending' });
        res.status(200).json({ message: 'Rejected', newHotels });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Declination failed , check after sometime' });
  }
};
