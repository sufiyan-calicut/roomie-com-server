const mongoose = require("mongoose");

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
    HotelId: {
      type: String,
    },
    Password: {
      type: String,
    },
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

const HotelDB = mongoose.model("HotelData", HotelDataSchema);

module.exports = HotelDB;
