const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

  // .........................................FETCH_BOOKING_COUNTS..............................................

  export const fetchBookingCounts = async (req, res) => {
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
  }