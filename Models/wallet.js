const mongoose = require('mongoose');

const WalletSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [
      {
        hotelId: {
          type: mongoose.Types.ObjectId,
        },
        bookingId: {
          type: mongoose.Types.ObjectId,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
        type: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const WalletDB = mongoose.model('wallet', WalletSchema);
module.exports = WalletDB;
