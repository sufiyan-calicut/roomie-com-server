const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../Models/userModel');
const HotelDB = require('../Models/hotelSchema.js');
const Razorpay = require('razorpay');
const BookingDB = require('../Models/bookingSchema');
const WalletDB = require('../Models/wallet');
const { ObjectId } = require('mongodb');
const crypto = require('crypto');
// .............................................INITIALIZE_RAZORPAY.......................................

export const initializePayment = async (req, res) => {
  let { totalRooms, checkInDate, hotelId } = req.body;

  try {
    const { availableRooms } = await HotelDB.findById(hotelId, { availableRooms: 1, _id: 0 });
    const bookedRooms = await BookingDB.find(
      {
        checkInDate: checkInDate,
        hotelId: hotelId,
        status: { $nin: ['cancelled', 'expired'] },
      },
      { totalRooms: 1, _id: 0 }
    );

    const totalBookedRooms = bookedRooms?.reduce((acc, curr) => {
      return (acc += curr.totalRooms);
    }, 0);

    const checkIsAvailable = () => {
      if (totalRooms <= availableRooms - totalBookedRooms) {
        return true;
      } else {
        return false;
      }
    };
    const isAvailable = checkIsAvailable();
    if (isAvailable) {
      const order = req.body.cashTobePay;

      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      var options = {
        amount: order * 100,
        currency: 'INR',
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          return res.status(500).json({ message: 'Internal Server Error' });
        }
        res.status(200).json({ order: order });
      });
    } else {
      res
        .status(401)
        .json({ message: ` Sorry, this hotel doesn't have enough available rooms. Please choose another hotel` });
    }
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};

// .............................................VERIFY_PAYMENT.......................................

export const verifyPayment = async (req, res) => {
  try {
    const { response } = req.body;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (razorpay_signature === expectedSignature) {
      const bookingId = Math.floor(Math.random() * 9000) + 1000;
      req.body.data.bookingId = bookingId + '';
      req.body.data.userId = req.body.userId;
      const newBooking = new BookingDB(req.body.data);
      const { _id } = await newBooking.save();

      let wallet = await WalletDB.findOne({ userId: req.body.userId });
      if (wallet && newBooking.paidByWallet > 0) {
        const transactions = [
          {
            hotelId: newBooking.hotelId,
            bookingId: newBooking._id,
            amount: newBooking.paidByWallet,
            description: 'new hotel booked',
            type: 'debit',
          },
        ];
        wallet.transactions.push(...transactions);
        wallet.balance = wallet.balance - newBooking.paidByWallet;

        await wallet.save();
      }

      await BookingDB.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $unwind: '$user_data',
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel_data',
          },
        },
        {
          $unwind: '$hotel_data',
        },
        {
          $project: {
            _id: 1,
            checkInDate: 1,
            bookingId: 1,
            checkOutDate: 1,
            totalRooms: 1,
            totalStayDays: 1,
            singleRoomPrice: 1,
            totalGuest: 1,
            totalPrice: 1,
            username: '$user_data.name',
            email: '$user_data.email',
            hotel_name: '$hotel_data.hotelName',
            hotel_address: '$hotel_data.address',
          },
        },
      ]).then((data) => {
        const bookingDetails = data[0];
        res.status(200).json({ message: 'Booked Successfully', data: bookingDetails });
      });
    } else {
      res.status(401).json({ message: 'Unable to update' });
    }
  } catch (error) {
    res.status(500).json({ message: 'internal server error' });
  }
};
// .............................................WALLET_PAYMENT...............................

export const walletPayment = async (req, res) => {
  try {
    const { availableRooms } = await HotelDB.findById(req.body.data.hotelId, { availableRooms: 1, _id: 0 });
    let { totalRooms, checkInDate, hotelId } = req.body.data;
    const bookedRooms = await BookingDB.find(
      {
        checkInDate: checkInDate,
        hotelId: hotelId,
        status: { $nin: ['cancelled', 'expired'] },
      },
      { totalRooms: 1, _id: 0 }
    );

    const totalBookedRooms = bookedRooms?.reduce((acc, curr) => {
      return (acc += curr.totalRooms);
    }, 0);

    const checkIsAvailable = () => {
      if (totalRooms <= availableRooms - totalBookedRooms) {
        return true;
      } else {
        return false;
      }
    };
    const isAvailable = checkIsAvailable();

    if (isAvailable) {
      const bookingId = Math.floor(Math.random() * 9000) + 1000;
      req.body.data.bookingId = bookingId + '';
      req.body.data.userId = req.body.userId;
      const newBooking = new BookingDB(req.body.data);
      const { _id } = await newBooking.save();

      let wallet = await WalletDB.findOne({ userId: req.body.userId });
      if (wallet) {
        const transactions = [
          {
            hotelId: newBooking.hotelId,
            bookingId: newBooking._id,
            amount: newBooking.paidByWallet,
            description: 'new hotel booked',
            type: 'debit',
          },
        ];
        wallet.transactions.push(...transactions);
        wallet.balance = wallet.balance - newBooking.paidByWallet;

        await wallet.save();
      }

      await BookingDB.aggregate([
        {
          $match: {
            _id: new ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $unwind: '$user_data',
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hotel_data',
          },
        },
        {
          $unwind: '$hotel_data',
        },
        {
          $project: {
            _id: 1,
            checkInDate: 1,
            bookingId: 1,
            checkOutDate: 1,
            totalRooms: 1,
            totalStayDays: 1,
            singleRoomPrice: 1,
            paidByWallet: 1,
            paidByCash: 1,
            totalGuest: 1,
            totalPrice: 1,
            username: '$user_data.name',
            email: '$user_data.email',
            hotel_name: '$hotel_data.hotelName',
            hotel_address: '$hotel_data.address',
          },
        },
      ]).then((data) => {
        const bookingDetails = data[0];
        res.status(200).json({ message: 'Booked Successfully', data: bookingDetails });
      });
      0;
    } else {
      res.status(401).json({
        message: `
        Sorry, this hotel doesn't have enough available rooms. Please choose another hotel.`,
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'internal server error ' });
  }
};
