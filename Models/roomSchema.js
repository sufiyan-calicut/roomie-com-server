const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  images: {
    type: String,
    required: true
  },
  checkboxe: [{
    type: String
  }],
  numberofBeds: {
    type: Number,
    required: true
  },
  numberOfRooms: {
    type: Number,
    required: true
  },
  numberofStayDays: {
    type: Number,
    required: true
  },
  allowedGuests: {
    type: Number,
    required: true
  },
  rules: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  }
},
{ timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
