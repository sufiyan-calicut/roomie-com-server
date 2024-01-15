const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

 // .........................................FETCH_ALL_BOOKINGS..............................................

 export const fetchBookings = async (req, res) => {
    try {
      const bookings = await BookingDB.aggregate([
        {
          $match: {
            status: req.body.status,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $unwind: '$user_data',
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel_data',
          },
        },
        {
          $unwind: '$hotel_data',
        },
        {
          $project: {
            _id: 1,
            checkInDate: 1,
            bookingId: 1,
            createdAt: 1,
            checkOutDate: 1,
            totalRooms: 1,
            totalStayDays: 1,
            singleRoomPrice: 1,
            totalGuest: 1,
            totalPrice: 1,
            paidByCash: 1,
            paidByWallet: 1,
            status: 1,
            message: 1,
            cancelledBy: 1,
            userName: '$user_data.name',
            userEmail: '$user_data.email',
            hotelName: '$hotel_data.hotelName',
            hotelAddress: '$hotel_data.address',
            hotelId: '$hotel_data.hotelId',
            hotelEmail: '$hotel_data.email',
          },
        },
      ]);

      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'No data' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching bookings' });
    }
  }