const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.ObjectId,
    },
    read: {
      type: Boolean,
      required: true,
      default:false
    },
  },
  { timestamps: true }
);

const notificationDB = mongoose.model("notifications", notificationSchema);
module.exports = notificationDB;
