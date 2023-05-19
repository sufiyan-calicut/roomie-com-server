const mongoose = require('mongoose');

const WalletSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    balance:{
      type:Number,
      required:true
    },
    transactions: [
      {
        hotelId: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        bookingId: {
          type: mongoose.Types.ObjectId,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        type:{
          type:String,
          required:true
        }
      },
    ],
  },
  { timestamps: true }
);

const WalletDB = mongoose.model('wallet', WalletSchema);
module.exports = WalletDB;
