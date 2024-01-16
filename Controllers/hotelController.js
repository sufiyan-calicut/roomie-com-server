const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// code for smtp ( otp send to email)
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'Gmail',

  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

module.exports = {
  // ..........................................................HOTEL_AUTHENTICATION.......................

  hotelAuth: async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const hotelToken = authHeader.split(' ')[1];

      if (!hotelToken) return res.status(401).json({ authorization: false });

      const result = await jwt.verify(hotelToken, process.env.JWT_SECRET);
      const hotel = await HotelDB.findOne({ _id: result.id });
      if (hotel.status == 'pending' || hotel.status == 'block') {
        return res.status(401).json({ autherization: false });
      }

      return res.status(hotel ? 200 : 401).json({ authorization: Boolean(hotel) });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  },

  // ..........................................................HOTEL_LOGIN.......................

  doLogin: async (req, res) => {
    try {
      const email = req.body.email;
      const hotelID = req.body.hotelID;
      const hotel = await HotelDB.findOne({ $and: [{ email: email }, { hotelId: hotelID }] });

      if (!hotel) {
        return res.status(401).json({ message: 'no hotel found' });
      } else if (hotel.status == 'blocked') {
        return res.status(403).json({ message: 'your account is blocked by admin' });
      } else {
        const hotelToken = jwt.sign({ id: hotel._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });
        res.status(200).json({ message: 'login Successfull', hotelToken, hotelId: hotel._id });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },
  // ..........................................................ADD_NEW_HOTEL_BY_REGISTRATION_FORM.......................

  newRegister: async (req, res) => {
    try {
      const isHotel = await HotelDB.findOne({ email: req.body.hotelData.email });
      if (isHotel) {
        const query = { email: req.body.hotelData.email };
        const update = {
          $set: {
            hotelName: req.body.hotelData.hotelName,
            phoneNumber: req.body.hotelData.phoneNumber,
            place: req.body.hotelData.place,
            price: req.body.hotelData.price,
            city: req.body.hotelData.city,
            state: req.body.hotelData.state,
            pincode: req.body.hotelData.pincode,
            images: req.body.imageUrl,
            amnities: req.body.hotelData.amnities,
            rooms: req.body.hotelData.rooms,
            Kitchen: req.body.hotelData.Kitchen,
            pool: req.body.hotelData.pool,
            allowedGuests: req.body.hotelData.allowedGuests,
            rules: req.body.hotelData.rules,
            description: req.body.hotelData.description,
            message: `I hope this message finds you well.We wanted to inform you that your request to partner with us is currently pending approval from our administrative team. We understand that waiting can be frustrating, but we want to ensure that we thoroughly review each request to ensure that we maintain the high standards that our customers have come to expect. We appreciate your interest in partnering with us and we look forward to the opportunity to work with you. Once your account is activated, we will inform you promptly and your hotel will become available on our site. We believe that this partnership will be mutually beneficial and we are excited to have you on board.`,
            status: 'Pending',
          },
        };
        const options = { upsert: true, new: true };

        const hotelData = await HotelDB.findOneAndUpdate(query, update, options);

        res.status(200).json({ message: 'data will be updated', success: true });
      } else {
        req.body.hotelData.images = [...req.body.imageUrl];
        req.body.hotelData.message = `I hope this message finds you well.We wanted to inform you that your request to partner with us is currently pending approval from our administrative  team. We understand that waiting can be frustrating, but we want to ensure that we thoroughly review each request to ensure that we maintain the high standards that our customers have come to expect. We appreciate your interest in partnering with us and we look forward to the opportunity to work with you. Once your account is activated, we will inform you promptly and your hotel will become available on our site. We believ that this partnership will be mutually beneficial and we are excited to have you on board.`;
        const email = req.body.hotelData.email;
        const prefix = req.body.hotelData.hotelName;
        let suffix = Math.floor(Math.random() * 1000);
        let uniqueId = `${prefix}_${suffix}`;
        uniqueId = uniqueId.replace(/\s/g, '');
        req.body.hotelData.hotelId = uniqueId;

        const Hotel = new HotelDB(req.body.hotelData);
        await Hotel.save();

        let mailOptions = {
          to: email,
          subject: 'Hotel ID',
          html:
            '<p>Dear user,Your registration is successfully completed: you can sign in with this Hotel ID' +
            "<h3 style='font-weight:bold;'>" +
            uniqueId +
            '</h3>' +
            '<p> Have a Good Day </p>',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.status(200).json({ message: 'request send to admin', success: true });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  // ..........................................................FETCH_HOTEL_DATA.......................
  fetchHotelData: async (req, res) => {
    try {
      const response = await HotelDB.findById(req.body.hotelId);
      if (response) {
        res.status(200).json({ data: response });
      } else {
        res.status(401).json({ message: 'error on fetching hotel data' });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },
  // ..........................................................FETCH_NEW_BOOKINGS.......................

  getNewRequests: async (req, res) => {
    try {
      const newBookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'pending' });
      if (newBookings) {
        res.status(200).json({ newBookings });
      } else {
        return res.status(401).json({ message: 'no new bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // ..........................................................ACCEPT_BOOKING.......................

  acceptBooking: async (req, res) => {
    try {
      await BookingDB.findByIdAndUpdate({ _id: req.body.bookingId }, { $set: { status: 'accepted' } });
      await BookingDB.find({ hotelId: req.body.hotelId, status: 'pending' }).then((newBookings) => {
        res.status(200).json({ message: 'Booking accepted ', newBookings });
      });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // ..........................................................FETCH_UPCOMING_BOOKINGS.......................

  fetchUpcomingBookings: async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'accepted' });
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no upcoming bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching upcoming request' });
    }
  },

  // ..........................................................FETCH_EXPIRED / checkout _BOOKINGS.......................

  fetchExpiredBookings: async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'expired' });
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no upcoming bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching upcoming request' });
    }
  },

  // ..........................................................FETCH_LIVE_BOOKINGS.......................

  fetchCurrentBookings: async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'active' });
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no upcoming bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching upcoming request' });
    }
  },

  // ..........................................................DECLINE_A_BOOKING_REQUEST.......................

  declineBooking: async (req, res) => {
    try {
      const date = new Date();
      const actionDate =
        date.toLocaleString('default', { weekday: 'long' }) +
        ' ' +
        date.getDate() +
        ' ' +
        date.toLocaleString('default', { month: 'long' });
      const response = await BookingDB.findByIdAndUpdate(
        { _id: req.body.bookingId },
        { $set: { cancelledBy: 'Hotel', message: req.body.message, status: 'cancelled', actionDate: actionDate } }
      );
      if (response) {
        res.status(200).json({ message: 'booking cancelled' });
      } else {
        res.status(401).json({ message: 'action failed' });
      }
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // ..........................................................FETCH_CANCELLED_BOOKINGS.......................

  fetchCancelledBookings: async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId, status: 'cancelled' });
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no cancelled bookings' });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching declined bookings' });
    }
  },

  // ..........................................................SEARCH_BOOKINGS.......................

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
          $match: {
            $or: [
              { 'user.name': { $regex: req.body.inputData, $options: 'i' } },
              { bookingId: { $regex: req.body.inputData, $options: 'i' } },
            ],
          },
        },
        {
          $unwind: '$user',
        },
        {
          $match: {
            hotelId: { $eq: new ObjectId(req.body.hotelId) },
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

  // ..........................................................FETCH_BOOKINGS_COUNTS.......................

  fetchBookingCounts: async (req, res) => {
    try {
      const bookings = await BookingDB.find({ hotelId: req.body.hotelId });
      if (!bookings) {
        return res.status(401).json({ message: 'no data found' });
      } else {
        const liveCount = bookings.filter((booking) => booking.status === 'active').length;

        const upcomingCount = bookings.filter((booking) => booking.status == 'accepted').length;
        const completedCount = bookings.filter((booking) => booking.status == 'expired').length;
        const newRequestCount = bookings.filter((booking) => booking.status == 'pending').length;

        res.status(200).json({ liveCount, upcomingCount, completedCount, newRequestCount });
      }
    } catch (error) {
      res.status(500).json({ message: 'error on fetching booking counts' });
    }
  },

  // ..........................................................CHANGE_BOOKING_STATUS.......................

  changeBookingStatus: async (req, res) => {
    try {
      await BookingDB.findByIdAndUpdate({ _id: req.body.data.id }, { $set: { status: req.body.data.value } }).then(
        (booking) => {
          if (booking) {
            res.status(200).json({ message: 'status updated' });
          } else {
            res.status(401).json({ message: 'action failed' });
          }
        }
      );
    } catch (error) {
      res.status(500).json({ message: 'error on changing booking status' });
    }
  },

  // ..........................................................FETCH_DATA_COUNTS.......................

  fetchDataCounts: async (req, res) => {
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
  },

  // ..........................................................SALES_DATA.......................

  fetchSalesData: async (req, res) => {
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
  },

  // ..........................................................DATA_FOR_GRAPH.......................

  fetchDataforGraph: async (req, res) => {
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
  },
};
