// .........................................FETCH_HOTEL_COUNTS..............................................

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

// .........................................FETCH_HOTEL_COUNTS..............................................

export const fetchHotelCounts = async (req, res) => {
  try {
    const hotels = await HotelDB.find({ status: { $in: ['Active', 'Block', 'Pending'] } });
    const Active = hotels.filter((hotel) => hotel.status == 'Active').length;
    const Block = hotels.filter((hotel) => hotel.status == 'Block').length;
    const Pending = hotels.filter((hotel) => hotel.status == 'Pending').length;
    const counts = {
      Active,
      Block,
      Pending,
    };
    res.status(200).json(counts);
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};
