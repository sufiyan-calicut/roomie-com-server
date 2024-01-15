const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');


  // .........................FETCH_BOOKINGS_BY_SEARCH..............................................

  searchBooking: async (req, res) => {
    try {
      const bookings = await BookingDB.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel',
          },
        },
        {
          $match: {
            $or: [
              { 'user.name': { $regex: req.body.inputData, $options: 'i' } },
              { bookingId: { $regex: req.body.inputData, $options: 'i' } },
              { 'hotel.hotelId': { $regex: req.body.inputData, $options: 'i' } },
              { 'hotel.hotelName': { $regex: req.body.inputData, $options: 'i' } },
            ],
          },
        },
        {
          $unwind: '$user',
        },
        {
          $unwind: '$hotel',
        },

        {
          $project: {
            id: 1,
            bookingId: 1,
            checkInDate: 1,
            checkOutDate: 1,
            singleRoomPrice: 1,
            totalRooms: 1,
            totalStayDays: 1,
            totalGuest: 1,
            totalPrice: 1,
            paidByCash: 1,
            paidByWallet: 1,
            status: 1,
            createdAt: 1,
            cancelledBy: 1,
            message: 1,
            hotelName: '$hotel.hotelName',
            hotelId: '$hotel.hotelId',
            hotelEmail: '$hotel.email',
            hotelPlace: '$hotel.place',
            hotelCity: '$hotel.city',
            userName: '$user.name',
            userEmail: '$user.email',
          },
        },
      ]);

      if (bookings.length == 0) {
        res.status(401).json({ message: 'no data found' });
      } else {
        res.status(200).json({ bookings });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching search data' });
    }
  }