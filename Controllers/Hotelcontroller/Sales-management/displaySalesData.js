const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
// ..........................................................SALES_DATA.......................

  export const fetchSalesData = async (req, res) => {
    try {
      const { day } = req.body;
      let data;

      if (day == 'day') {
        data = await BookingDB.aggregate([
          {
            $match: {
              $and: [
                { hotelId: new ObjectId(req.body.hotelId) },

                {
                  $expr: {
                    $and: [
                      { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'day' } }] },
                      {
                        $lt: [
                          { $toDate: '$createdAt' },
                          { $dateTrunc: { date: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), unit: 'day' } },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
            },
          },
          { $unwind: '$userData' },
        ]);

      
      } else if (day == 'week') {
        data = await BookingDB.aggregate([
          {
            $match: {
              $and: [
                { hotelId: new ObjectId(req.body.hotelId) },
                { status: 'expired' },
                {
                  $expr: {
                    $and: [
                      { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'week' } }] },
                      {
                        $lt: [
                          {
                            $toDate: '$createdAt',
                          },
                          {
                            $dateTrunc: { date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), unit: 'day' },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
            },
          },
          { $unwind: '$userData' },
        ]);
      } else if (day == 'month') {
        data = await BookingDB.aggregate([
          {
            $match: {
              $and: [
                { hotelId: new ObjectId(req.body.hotelId) },
                { status: 'expired' },
                {
                  $expr: {
                    $and: [
                      { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'month' } }] },
                      {
                        $lt: [
                          {
                            $toDate: '$createdAt',
                          },
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
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
            },
          },
          { $unwind: '$userData' },
        ]);
      } else if (day == 'year') {
        data = await BookingDB.aggregate([
          {
            $match: {
              $and: [
                { hotelId: new ObjectId(req.body.hotelId) },
                { status: 'expired' },
                {
                  $expr: {
                    $and: [
                      { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'year' } }] },
                      {
                        $lt: [
                          {
                            $toDate: '$createdAt',
                          },
                          {
                            $dateTrunc: { date: new Date(new Date().getFullYear(), 12, 0), unit: 'day' },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'userData',
            },
          },
          { $unwind: '$userData' },
        ]);
      }

      if (!data) {
        res.status(401).json({ message: 'no data found' });
      } else {
        res.status(200).json(data);
      }
    } catch (error) {
      res.status(500).json(error?.response?.data?.message);
    }
  }