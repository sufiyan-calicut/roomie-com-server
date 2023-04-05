const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    block: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    address: [
      {
        addressType: {
          type: String,
        },
        address: {
          type: String,
        },
      },
    ],
  },

  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
