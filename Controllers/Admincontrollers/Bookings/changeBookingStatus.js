const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');

  // .........................................CHANGE_BOOKING_STATUS..............................................

  export const changeBookingStatus = async (req, res) => {
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
  }