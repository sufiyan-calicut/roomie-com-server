const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotelId:{
   type: mongoose.Types.ObjectId
  },
  roomNumber: {
    type: String,
  },
  price: {
    type: Number,
  },
  images: [{
    type: String,
  }],
  amnities: [{
    type: String
  }],
},
{ timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
