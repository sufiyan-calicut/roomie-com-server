const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// ..........................................................DATA_FOR_GRAPH.......................

export const fetchDataforGraph = async (req, res) => {
  try {
    const data = await BookingDB.aggregate([
      // Filter data for the last 7 days
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          hotelId: new ObjectId(req.body.hotelId),
        },
      },
      // Group data by day of the week
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          totalGuests: { $sum: '$totalGuest' },
          totalPrice: { $sum: '$totalPrice' },
          bookings: { $sum: 1 },
        },
      },
      // Sort data by day of the week
      {
        $sort: { _id: 1 },
      },
      // Project fields to match the desired output format
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
};
