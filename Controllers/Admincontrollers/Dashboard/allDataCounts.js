const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');
 
 
 // .....................................FETCH_DATA_COUNTS..........................................

 export const fetchDataCounts = async (req, res) => {
    try {
      const totalBookings = await BookingDB.find();
      const totalUsers = await userModel.find();
      const weekSale = await BookingDB.aggregate([
        {
          $match: {
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
        },
      ]);
      const monthSale = await BookingDB.aggregate([
        {
          $match: {
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

      const data = {
        totalBookings: totalBookings?.length,
        totalUsers: totalUsers?.length,
        weekSale: weekSale?.reduce((acc, curr) => (acc += curr.totalPrice), 0),
        monthSale: monthSale?.reduce((acc, curr) => (acc += curr.totalPrice), 0),
      };

      const wk = weekSale.reduce((acc, curr) => {
        return acc + curr.totalPrice;
      }, 0);
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json(error.response.data.message);
    }
  }