const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'userModel'
  },
  hotelId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'HotelDB'
  },
  bookingId:{
    type:String,
    required:true
  },
  checkInDate: {
    type: String,
    required: true
  },
  checkOutDate: {
    type: String,
    required: true
  },
  singleRoomPrice: {
    type: Number,
    required: true
  },
  totalRooms: {
    type: Number,
    required: true
  },
  totalStayDays:{
    type: Number,
    required: true,
    default:1
  },
  totalGuest: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paidByCash:{
    type:Number,
    required:true
  },
  paidByWallet:{
    type:Number,
    required:true
  },
  status:{
    type: String,
    required: true,
    default:'pending'
    // booked .......... checkin ...........checkout........cancelled
  },
  message:{
    type: String,
  },
  cancelledBy:{
    type: String
  },
  actionDate:{
    type: String
  }
},{timestamps:true});

const BookingDB = mongoose.model('Booking', bookingSchema);
module.exports = BookingDB;
