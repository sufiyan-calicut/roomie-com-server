const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// ..........................................................FETCH_DATA_COUNTS.......................

export const fetchDataCounts = async (req, res) => {
  try {
    const totalBookings = await BookingDB.find({ hotelId: req.body.hotelId });
    const totalUsers = await User.find();
    const weekSale = await BookingDB.aggregate([
      {
        $match: {
          $and: [
            { hotelId: new ObjectId(req.body.hotelId) }, // add the new match condition
            {
              $expr: {
                $and: [
                  {
                    $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'week' } }],
                  },
                  {
                    $lt: [
                      { $toDate: '$createdAt' },
                      { $dateTrunc: { date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), unit: 'day' } },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    ]);
    const monthSale = await BookingDB.aggregate([
      {
        $match: {
          hotelId: new ObjectId(req.body.hotelId),
          $expr: {
            $and: [
              {
                $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'month' } }],
              },
              {
                $lt: [
                  { $toDate: '$createdAt' },
                  {
                    $dateTrunc: {
                      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
                      unit: 'day',
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    ]);

    const totalSale = await BookingDB.find({ hotelId: req.body.hotelId });

    const data = {
      totalBookings: totalBookings?.length,
      totalSale: totalSale?.reduce((acc, curr) => (acc += curr.totalPrice), 0),
      weekSale: weekSale?.reduce((acc, curr) => (acc += curr.totalPrice), 0),
      monthSale: monthSale?.reduce((acc, curr) => (acc += curr.totalPrice), 0),
    };

    const wk = weekSale.reduce((acc, curr) => {
      return acc + curr.totalPrice;
    }, 0);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error?.response?.data?.message);
  }
};
