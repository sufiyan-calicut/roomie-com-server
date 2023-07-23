const mongoose = require('mongoose');

const HotelDataSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    price: {
      type: Number,
    },
    place: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    pincode: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    amnities: [
      {
        type: String,
      },
    ],
    rooms: {
      type: Number,
    },
    kitchen: {
      type: Number,
    },
    pool: {
      type: Number,
    },
    allowedGuests: {
      type: Number,
    },
    rules: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
    hotelId: {
      type: String,
    },
    Password: {
      type: String,
    },
    status: {
      type: String,
      default: 'Pending',
    },
    message:{
      type:String,
      required:true
    },
    availableRooms: {
      type: Number,
      default: 5,
    },
    bookedRooms: {
      type: Number,
    },

  },
  { timestamps: true }
);

const HotelDB = mongoose.model('HotelData', HotelDataSchema);

module.exports = HotelDB;
