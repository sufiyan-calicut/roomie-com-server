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

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  service: 'Gmail',
  /* eslint-disable */
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASS,
  },
});

// global variables
let otp;
let name;
let place;
let email;
let phone;
let password;

module.exports = {
  // .............................................USER_AUTH_FOR_COMPONENT_RENDER...............................

  checkAuth: async (req, res) => {
    try {
      const { authorization: authHeader = '' } = req.headers;
      const token = authHeader.split(' ')[1];

      if (!token) return res.status(401).json({ authorization: false });

      const result = await jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ $and: [{ _id: result.id, userType: 'user' }] });
      return res.status(user ? 200 : 401).json({ authorization: Boolean(user) });
    } catch (error) {
      res.status(500).json({ authorization: false });
    }
  },

  // .............................................SEND_OTP_AFTER_REGISTRAION..................................

  sendOtp: async (req, res) => {
    try {
      const userExist = await User.findOne({ email: req.body.email });
      if (userExist) {
        return res.status(200).json({ message: 'user already exist', success: false });
      } else {
        name = req.body.name;
        place = req.body.place;
        email = req.body.email;
        phone = req.body.phone;
        password = req.body.password;

        otp = Math.random();
        otp = otp * 1000000;
        otp = parseInt(otp);

        let mailOptions = {
          to: email,
          subject: 'One-Time Password (OTP) for Login: ',
          html:
            '<p>Dear user,Your one-time password (OTP) for login is:' +
            "<h1 style='font-weight:bold;'>" +
            otp +
            '</h1>' + // html body
            '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
          } else {
            console.log('no issue', info);
            // Check if the info object is not undefined before accessing its properties
            if (info && info.messageId) {
              console.log('Message sent: %s', info.messageId);
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            } else {
              console.log('Email sent, but message ID not available in the info object.');
            }
            res.status(200).json({ message: 'otp send to your email', success: true });
          }

          setTimeout(function () {
            otp = 0;
          }, 60 * 5 * 1000); // 5 minutes in milliseconds
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'error on user creation', success: false });
    }
  },

  // ..............................................VERIFY_OTP_ENTERED_BY_USER.................................

  verifyOtp: async (req, res) => {
    try {
      const userOtp = parseInt(req.body.otp);
      if (otp === userOtp) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        const userData = {
          name,
          place,
          email,
          phone,
          password: hashedPassword,
        };
  
        const newUser = new User(userData);
        const userdb = await newUser.save();
  
        const userdbId = userdb._id.toString();
        const wallet = new WalletDB({ userId: userdbId });
        await wallet.save();
  
        console.log('User created successfully');
        res.status(200).json({ message: 'User created successfully', success: true });
      } else {
        res.status(403).json({ message: 'Incorrect OTP' });
      }
    } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // ..............................................USER_AUTHENTICATION / USER_LOGIN...........................

  doLogin: async (req, res) => {
    try {


      const { email, password } = req.body;
      const userExist = await User.findOne({ $and: [{ email: email }, { userType: 'user' }] });

      if (!userExist) {
        return res.status(200).json({ message: "user doesn't exist", success: false });
      }
      if (userExist.block) {
        return res.status(200).json({ message: 'you are blocked by admin', success: false });
      }

      const isMatch = await bcrypt.compare(password, userExist.password);
      if (!isMatch) {
        return res.status(200).json({ message: 'incorrect password', success: false });
      } else {
        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });

        res.status(200).json({ message: 'Login successful', success: true, data: token });
      }
    } catch (error) {
      res.status(500).json({ message: 'network error', success: false });
    }
  },

  // ..............................................RESEND_OTP................................................

  resendOtp: async (req, res) => {
    try {
      otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);

      if (email) {
        let mailOptions = {
          to: email,
          subject: 'One-Time Password (OTP) for Login: ',
          html:
            '<p>Dear user,Your one-time password (OTP) for login is:' +
            "<h1 style='font-weight:bold;'>" +
            otp +
            '</h1>' +
            '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log('Error sending email:', error);
          } else {
            // Check if the info object is not undefined before accessing its properties
            if (info && info.messageId) {
              console.log('Message sent: %s', info.messageId);
            } else {
              console.log('Email sent, but message ID not available in the info object.');
            }
          }

          setTimeout(function () {
            otp = 0;
          }, 60 * 5 * 1000); // 5 minutes in milliseconds

          res.status(200).json({ message: 'otp send to your email', success: true });
        });
      } else {
        res.status(401).json({ message: 'unable to send otp', success: false });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to send email.' });
    }
  },

  // ..............................................GET_USER_INFO............................................

  getUserInfo: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.userId });

      if (!user) {
        return res.status(200).json({ message: "user doesn't exist", success: false });
      } else {
        res.status(200).json({
          success: true,
          data: {
            name: user.name,
            email: user.email,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error getting on user info', success: false });
    }
  },

  // ..............................................PASSWORD_RESET...........................................

  resetPassword: async (req, res) => {
    try {
      email = req.body.usermail;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({ message: "user doesn't exist", success: false });
      }
      otp = Math.random();
      otp = otp * 1000000;
      otp = parseInt(otp);

      let mailOptions = {
        to: email,
        subject: 'One-Time Password (OTP) for login: ',
        html:
          '<p>Dear user,Your one-time password (OTP) for login is:' +
          "<h1 style='font-weight:bold;'>" +
          otp +
          '</h1>' +
          '<p> Please enter this code to access your account. This OTP will expire in 5 minutes.</p>',
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return res.status(401).json({ message: 'unable to send otp' });
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        setTimeout(function () {
          otp = 0;
        }, 60 * 5 * 1000); // set the time for otp validation ( 5 minute )

        res.status(200).json({ message: 'otp send to your email', success: true });
      });
    } catch (error) {
      res.status(500).json({ message: 'internal server error' });
    }
  },

  // ..............................................VERIFY_RESET_OTP.......................................

  verifyResetOtp: async (req, res) => {
    const userotp = parseInt(req.body.userOtp);
    try {
      if (otp === userotp) {
        return res.status(200).json({ message: 'otp verified', success: true });
      } else {
        return res.status(401).json({ message: 'incorrect otp', success: false });
      }
    } catch (error) {
      res.status(500).json({ message: 'someting went wrong', success: false });
    }
  },

  // ..............................................UPDATE_PASSWORD......................................

  updateNewPassword: async (req, res) => {
    try {
      const password = req.body.password;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await User.findOne({ email: email });

      user.password = hashedPassword;

      await user
        .save()
        .then(() => {
          res.status(200).json({ message: 'password updated', success: true });
        })
        .catch((err) => {
          res.status(401).json({ message: 'error in updation' });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // .............................................FETCHING_ALL_ROOMS....................................

  displayRooms: async (req, res) => {
    try {
      await HotelDB.find()
        .limit(20)
        .then((hotels) => {
          res.status(200).json(hotels);
        })
        .catch((error) => {
          res.status(401).json({ message: `couldn't fetch the data` });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // .............................................FETCH_SINGLE_HOTEL_DATA_SELECTED_BY_USER.............

  fetchSingleHotelData: async (req, res) => {
    try {
      const wallet = await WalletDB.findOne({ userId: req.body.userId }, { balance: 1, _id: 0 });

      await HotelDB.findOne({ _id: req.body.id })
        .then((data) => {
          res.status(200).json({ data: data, wallet });
        })
        .catch((err) => {
          res.status(401).json({ message: `couldn't find data` });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // .............................................FETCH_SEARCH_DATA.....................................

  fetchSearchData: async (req, res) => {
    try {
      const skip = req.body.hotelData.length;
      const location = req.body.location.trim();
      const userInput = {
        $or: [
          { hotelName: { $regex: new RegExp(location, 'i') } },
          { place: { $regex: new RegExp(location, 'i') } },
          { city: { $regex: new RegExp(location, 'i') } },
          { state: { $regex: new RegExp(location, 'i') } },
        ],
        amnities: req.body.amnities == null || req.body.amnities?.length == 0 ? null : { $all: [...req.body.amnities] },
        availableRooms: req.body.roomCounts ? { $gte: req.body.roomCounts } : null,
        price: req.body.price ? { $gte: 1000 } : null,
        status: 'Active',
      };

      const queryConditions = {};
      for (const key in userInput) {
        if (userInput[key] !== null) {
          queryConditions[key] = userInput[key];
        }
      }
      const count = await HotelDB.countDocuments(queryConditions);

      let isDataOver = Boolean(count <= skip + 6);
      await HotelDB.find(queryConditions)
        .sort({ price: req.body.sort })
        .limit(6 + skip)
        .then((data) => {
          res.status(200).json({ data, isDataOver });
        })
        .catch((error) => {
          res.status(401).json({ message: 'error on fetching data from db' });
        });
    } catch (error) {
      res.status(500).json({ message: 'something went wrong' });
    }
  },

  // .............................................FETCH_ALL_BOOKINGS...................................

  fetchBookings: async (req, res) => {
    try {
      const bookings = await BookingDB.aggregate([
        {
          $match: {
            userId: { $eq: new ObjectId(req.body.userId) },
          },
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hoteldata',
          },
        },
        { $unwind: '$hoteldata' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userdata',
          },
        },
        { $unwind: '$userdata' },
        {
          $project: {
            id: 1,
            createdAt: 1,
            bookingId: 1,
            checkInDate: 1,
            checkOutDate: 1,
            singleRoomPrice: 1,
            totalRooms: 1,
            totalStayDays: 1,
            cancelledBy: 1,
            message: 1,
            totalGuest: 1,
            totalPrice: 1,
            paidByCash: 1,
            paidByWallet: 1,
            status: 1,
            hotelname: '$hoteldata.hotelName',
            hotelId: '$hoteldata._id',
            username: '$userdata.name',
            userId: '$userdata._id',
            userEmail: '$userdata.email',
          },
        },
      ]);
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no data found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // .............................................SEARCH_BOOKINGS.......................................

  searchBooking: async (req, res) => {
    try {
      const bookings = await BookingDB.aggregate([
        {
          $match: {
            userId: { $eq: new ObjectId(req.body.userId) },
          },
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hoteldata',
          },
        },
        { $unwind: '$hoteldata' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userdata',
          },
        },
        { $unwind: '$userdata' },
        {
          $match: {
            $or: [
              { 'hoteldata.hotelName': { $regex: req.body.searchInput, $options: 'i' } },
              { bookingId: { $regex: req.body.searchInput, $options: 'i' } },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            bookingId: 1,
            createdAt: 1,
            checkInDate: 1,
            checkOutDate: 1,
            singleRoomPrice: 1,
            totalRooms: 1,
            totalStayDays: 1,
            totalGuest: 1,
            totalPrice: 1,
            status: 1,
            message: 1,
            cancelledBy: 1,
            hotelname: '$hoteldata.hotelName',
            username: '$userdata.name',
            userEmail: '$userdata.email',
          },
        },
      ]);
      if (bookings) {
        res.status(200).json({ bookings });
      } else {
        res.status(401).json({ message: 'no data found' });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // .............................................CANCEL_BOOKING.......................................

  cancellBooking: async (req, res) => {
    try {
      const { bookingData, userId } = req.body;

      const booking = await BookingDB.findOneAndUpdate(
        { _id: bookingData.booking._id },
        { $set: { message: bookingData.reasonText, cancelledBy: 'customer', status: 'cancelled' } }
      );
      const transactions = [
        {
          hotelId: booking.hotelId,
          bookingId: booking._id,
          amount: booking.totalPrice,
          description: bookingData.reasonText,
          type: 'credit',
        },
      ];
      let wallet = await WalletDB.findOne({ userId: req.body.userId });

      if (wallet) {
        wallet.transactions.push(...transactions);
        wallet.balance = wallet.balance + booking.totalPrice;
      } else {
        wallet = new WalletDB({ userId, balance: booking.totalPrice, transactions });
      }

      await wallet.save();

      const singleBooking = await BookingDB.aggregate([
        {
          $match: {
            _id: { $eq: new ObjectId(booking._id) },
          },
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'hotelId',
            foreignField: '_id',
            as: 'hoteldata',
          },
        },
        { $unwind: '$hoteldata' },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userdata',
          },
        },
        { $unwind: '$userdata' },
        {
          $project: {
            id: 1,
            createdAt: 1,
            bookingId: 1,
            checkInDate: 1,
            checkOutDate: 1,
            singleRoomPrice: 1,
            totalRooms: 1,
            totalStayDays: 1,
            cancelledBy: 1,
            message: 1,
            totalGuest: 1,
            totalPrice: 1,
            status: 1,
            hotelname: '$hoteldata.hotelName',
            hotelId: '$hoteldata._id',
            username: '$userdata.name',
            userId: '$userdata._id',
            userEmail: '$userdata.email',
          },
        },
      ]);

      res.json({ message: 'Booking cancelled successfully', data: singleBooking[0] });
    } catch (error) {
      res.status(500).json({ message: 'internal server error' });
    }
  },
  // ..............................................FETCH_PROFILE_DATA.............................................
  fetchProfileData: async (req, res) => {
    try {
      const data = await User.aggregate([
        {
          $match: {
            _id: new ObjectId(req.body.userId),
          },
        },
        {
          $lookup: {
            from: 'wallets',
            localField: '_id',
            foreignField: 'userId',
            as: 'walletData',
          },
        },
        {
          $project: {
            _id: 0,
            name: 1,
            email: 1,
            phone: 1,
            walletBalance: {
              $ifNull: [{ $arrayElemAt: ['$walletData.balance', 0] }, 'No Wallet'],
            },
          },
        },
      ]);

      if (!data) {
        return res.status(401).json({ message: 'unable to fetch user details' });
      } else {
        res.status(200).json(data[0]);
      }
    } catch (error) {
      res.status(500).send({ message: 'internal server error!' });
    }
  },

  // .............................................FETCH_WALLET_HISTORY.......................................

  fetchWalletHistory: async (req, res) => {
    try {
      const walletData = await WalletDB.aggregate([
        {
          $match: {
            userId: new ObjectId(req.body.userId),
          },
        },
        {
          $unwind: '$transactions',
        },
        {
          $lookup: {
            from: 'hoteldatas',
            localField: 'transactions.hotelId',
            foreignField: '_id',
            as: 'transactions.hotel',
          },
        },
        {
          $lookup: {
            from: 'bookings',
            localField: 'transactions.bookingId',
            foreignField: '_id',
            as: 'transactions.booking',
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            balance: 1,
            transactions: {
              hotel: { $arrayElemAt: ['$transactions.hotel', 0] },
              booking: { $arrayElemAt: ['$transactions.booking', 0] },
              amount: 1,
              description: 1,
              type: 1,
              _id: 1,
            },
            createdAt: 1,
            updatedAt: 1,
            __v: 1,
          },
        },
      ]);

      if (walletData) {
        res.status(200).json(walletData);
      } else {
        res.status(401).json({ message: `you don't have a wallet history` });
      }
    } catch (error) {
      res.status(500).json({ message: 'internal server error' });
    }
  },

  // .............................................INITIALIZE_RAZORPAY.......................................

  initializePayment: async (req, res) => {
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
  },

  // .............................................VERIFY_PAYMENT.......................................

  verifyPayment: async (req, res) => {
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
  },
  // .............................................WALLET_PAYMENT...............................

  walletPayment: async (req, res) => {
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
  },
};
