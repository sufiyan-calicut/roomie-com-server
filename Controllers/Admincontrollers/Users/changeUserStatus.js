const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel.js');
const HotelDB = require('../Models/hotelSchema.js');
const BookingDB = require('../Models/bookingSchema.js');


 // .......................................CHANGE_USER_STATUS.........................................

 export const changeUserStatus = async (req, res) => {
    try {
      const temp = req.body;
      const id = temp.record._id;

      const userdata = await userModel.find({ _id: id });
      const user = userdata[0];

      if (user.block) {
        user.block = false;
      } else {
        user.block = true;
      }
      await user.save();
      const allUsers = await userModel.find({ userType: 'user' });
      res.status(200).json({
        message: `user ${user.block ? 'blocked' : 'unblocked'} successfully`,
        success: true,
        data: allUsers,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error applying users list', success: false, error });
    }
  }