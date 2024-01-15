const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');


  // ......................................FETCH_DATA_FOR_ADMIN_GRAPH...................................

 export const fetchDataforGraph = async (req, res) => {
    try {
      const data = await BookingDB.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: '$createdAt' },
            totalGuests: { $sum: '$totalGuest' },
            totalPrice: { $sum: '$totalPrice' },
            bookings: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            day: {
              $switch: {
                branches: [
                  { case: { $eq: ['$_id', 1] }, then: 'Sunday' },
                  { case: { $eq: ['$_id', 2] }, then: 'Monday' },
                  { case: { $eq: ['$_id', 3] }, then: 'Tuesday' },
                  { case: { $eq: ['$_id', 4] }, then: 'Wednesday' },
                  { case: { $eq: ['$_id', 5] }, then: 'Thursday' },
                  { case: { $eq: ['$_id', 6] }, then: 'Friday' },
                  { case: { $eq: ['$_id', 7] }, then: 'Saturday' },
                ],
              },
            },
            customers: '$totalGuests',
            sales: '$totalPrice',
            bookings: '$bookings',
            _id: 0,
          },
        },
      ]);

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'internal server error' });
    }
  }