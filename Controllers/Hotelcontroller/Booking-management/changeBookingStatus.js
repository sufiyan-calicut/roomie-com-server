const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// ..........................................................CHANGE_BOOKING_STATUS.......................

export const changeBookingStatus = async (req, res) => {
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
};
