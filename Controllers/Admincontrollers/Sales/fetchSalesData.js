const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

// ...................FETCH_SALES_DATA..............................................

export const fetchSalesData = async (req, res) => {
  try {
    const { day } = req.body;
    let data;

    if (day == 'day') {
      data = await BookingDB.aggregate([
        {
          $match: {
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
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotelData',
          },
        },
        { $unwind: '$hotelData' },
      ]);
    } else if (day == 'week') {
      data = await BookingDB.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'week' } }] },
                {
                  $lt: [
                    { $toDate: '$createdAt' },
                    { $dateTrunc: { date: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), unit: 'day' } },
                  ],
                },
              ],
            },

            status: 'expired',
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
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotelData',
          },
        },
        { $unwind: '$hotelData' },
      ]);
    } else if (day == 'month') {
      data = await BookingDB.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'month' } }] },
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
            status: 'expired',
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
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotelData',
          },
        },
        { $unwind: '$hotelData' },
      ]);
    } else if (day == 'year') {
      data = await BookingDB.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $gte: [{ $toDate: '$createdAt' }, { $dateTrunc: { date: new Date(), unit: 'year' } }] },
                {
                  $lt: [
                    { $toDate: '$createdAt' },
                    { $dateTrunc: { date: new Date(new Date().getFullYear(), 12, 0), unit: 'day' } },
                  ],
                },
              ],
            },
            status: 'expired',
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
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotelData',
          },
        },
        { $unwind: '$hotelData' },
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
};
