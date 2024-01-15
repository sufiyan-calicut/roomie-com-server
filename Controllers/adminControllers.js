const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

module.exports = {
  // .........................................ADMIN_AUTH..............................................

  checkAuth: async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const adminToken = authHeader.split(' ')[1];

      if (!adminToken) return res.status(401).json({ authorization: false, message: 'one' });

      const result = await jwt.verify(adminToken, process.env.JWT_SECRET);
      const user = await userModel.findOne({ _id: result.id, userType: 'admin' });

      return res.status(user ? 200 : 401).json({ authorization: Boolean(user), message: 'two' });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  },

  // .........................................ADMIN_LOGIN..............................................

  adminSignIn: async (req, res) => {
    try {
      let admin = await userModel.findOne({
        email: req.body.email,
        userType: 'admin',
      });
      if (!admin) {
        return res.status(200).json({ message: 'incorrect email', success: false });
      }
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res.status(200).json({ message: 'incorrect password', success: false });
      } else {
        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });

        res.status(200).json({
          message: 'welcome to admin panel',
          success: true,
          data: adminToken,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'error in admin login', success: false });
    }
  },

  // .........................................DISPLAY_NEW_HOTELS_REQUEST..............................................

  newHotelRequests: async (req, res) => {
    try {
      const newHotels = await HotelDB.find({ status: 'Pending' });
      if (!newHotels) {
        return res.status(404).json();
      }
      res.status(200).json(newHotels);
    } catch (error) {
      res.status(500).send({ message: 'internal server error' });
    }
  },

  // .........................................DECLINE_HOTEL_REQUEST..............................................

  declineHotelRequest: async (req, res) => {
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
  },

  // .........................................ACCEPT_HOTEL_REQUEST..............................................

  acceptHotelRequest: async (req, res) => {
    try {
      const hotelID = req.body.hotelID;
      const hotel = await HotelDB.findOne({ _id: hotelID });

      hotel.status = 'Active';
      hotel.message = `We are pleased to inform you that your account has been successfully activated. We are committed to
      providing you with a seamless booking experience, and we are confident that our partnership will result in
      increased bookings for your hotel.`;

      await hotel.save().then(async () => {
        const newHotels = await HotelDB.find({ status: 'Pending' });
        res.status(200).json({ message: 'Accepted', newHotels });
      });
    } catch (error) {
      res.status(500).json({ message: 'failed , check after sometime' });
    }
  },

  // .........................................DISPLAY_ALL_AVAILABLE_HOTELS..............................................

  getHotelsData: async (req, res) => {
    try {
      const hotels = await HotelDB.find();
      res.status(200).json({ hotelData: hotels });
    } catch (error) {
      res.status(500).json({ message: 'No Hotel Exists' });
    }
  },

  // .........................................CHANGE_HOTEL_STATUS..............................................

  changeHotelStatus: async (req, res) => {
    try {
      const { hotelID, status } = req.body;
      await HotelDB.findByIdAndUpdate({ _id: hotelID }, { $set: { status: status } });
      const hotels = await HotelDB.find({ status: { $nin: ['Rejected', 'Pending'] } });
      res.status(200).json({ message: 'Status Changed', hotelData: hotels });
    } catch (error) {
      res.status(500).json("Something went wrong, Status didn't Change");
    }
  },

  // .........................................FETCH_ALL_BOOKINGS..............................................

  fetchBookings: async (req, res) => {
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
  },

  // .........................................CHANGE_BOOKING_STATUS..............................................

  changeBookingStatus: async (req, res) => {
    try {
      await BookingDB.findByIdAndUpdate(
        { _id: req.body.data.id },
        { $set: { status: req.body.data.value, message: req.body.data.reason, cancelledBy: req.body.data.cancelledBy } }
      ).then((booking) => {
        if (booking) {
          res.status(200).json({ message: 'status updated' });
        } else {
          res.status(401).json({ message: 'action failed' });
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'error on changing booking status' });
    }
  },

  // .........................................FETCH_BOOKING_COUNTS..............................................

  fetchBookingCounts: async (req, res) => {
    try {
      const bookings = await BookingDB.find();
      if (!bookings) {
        return res.status(401).json({ message: 'no data found' });
      } else {
        const totalBookings = bookings.filter((booking) => booking).length;
        const cancelledBookings = bookings.filter((booking) => booking.status === 'cancelled').length;
        const liveCount = bookings.filter((booking) => booking.status === 'active').length;

        const upcomingCount = bookings.filter((booking) => booking.status == 'accepted').length;
        const completedCount = bookings.filter((booking) => booking.status == 'expired').length;
        const newRequestCount = bookings.filter((booking) => booking.status == 'pending').length;

        res
          .status(200)
          .json({ liveCount, upcomingCount, completedCount, newRequestCount, totalBookings, cancelledBookings });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching booking counts' });
    }
  },

  // .........................................FETCH_BOOKINGS_BY_SEARCH..............................................

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
  },

  // .........................................FETCH_HOTEL_COUNTS..............................................

  fetchHotelCounts: async (req, res) => {
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
  },

  // .........................................FETCH_SALES_DATA..............................................

  fetchSalesData: async (req, res) => {
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
  },

  // .....................................FETCH_DATA_COUNTS..........................................

  fetchDataCounts: async (req, res) => {
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
  },

  // ......................................FETCH_DATA_FOR_ADMIN_GRAPH...................................

  fetchDataforGraph: async (req, res) => {
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
  },

  // ......................................FETCH_DATA_FOR_ADMIN_GRAPH...................................
  fetchAllUsers: async (req, res) => {
    try {
      const data = await userModel.find({ userType: 'user' });
      if (!data) {
        return res.status(401).json({ message: 'no users exist', success: false });
      }
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: 'Error applying users list', success: false, error });
    }
  },

  // .......................................CHANGE_USER_STATUS.........................................

  changeUserStatus: async (req, res) => {
    try {
      const temp = req.body;
      const id = temp.record._id;

      const userdata = await userModel.find({ _id: id });
      const user = userdata[0];

      if (user.block) {
        user.block = false;
      } else {
        user.block = true;
      }
      await user.save();
      const allUsers = await userModel.find({ userType: 'user' });
      res.status(200).json({
        message: `user ${user.block ? 'blocked' : 'unblocked'} successfully`,
        success: true,
        data: allUsers,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error applying users list', success: false, error });
    }
  },
};
