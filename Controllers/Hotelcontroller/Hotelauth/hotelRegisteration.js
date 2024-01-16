const HotelDB = require('../Models/hotelSchema');
const User = require('../Models/userModel');
const BookingDB = require('../Models/bookingSchema');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    service: 'Gmail',
  
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS,
    },
  });
  
  // ..........................................................ADD_NEW_HOTEL_BY_REGISTRATION_FORM.......................

  export const newRegister = async (req, res) => {
    try {
      const isHotel = await HotelDB.findOne({ email: req.body.hotelData.email });
      if (isHotel) {
        const query = { email: req.body.hotelData.email };
        const update = {
          $set: {
            hotelName: req.body.hotelData.hotelName,
            phoneNumber: req.body.hotelData.phoneNumber,
            place: req.body.hotelData.place,
            price: req.body.hotelData.price,
            city: req.body.hotelData.city,
            state: req.body.hotelData.state,
            pincode: req.body.hotelData.pincode,
            images: req.body.imageUrl,
            amnities: req.body.hotelData.amnities,
            rooms: req.body.hotelData.rooms,
            Kitchen: req.body.hotelData.Kitchen,
            pool: req.body.hotelData.pool,
            allowedGuests: req.body.hotelData.allowedGuests,
            rules: req.body.hotelData.rules,
            description: req.body.hotelData.description,
            message: `I hope this message finds you well.We wanted to inform you that your request to partner with us is currently pending approval from our administrative team. We understand that waiting can be frustrating, but we want to ensure that we thoroughly review each request to ensure that we maintain the high standards that our customers have come to expect. We appreciate your interest in partnering with us and we look forward to the opportunity to work with you. Once your account is activated, we will inform you promptly and your hotel will become available on our site. We believe that this partnership will be mutually beneficial and we are excited to have you on board.`,
            status: 'Pending',
          },
        };
        const options = { upsert: true, new: true };

        const hotelData = await HotelDB.findOneAndUpdate(query, update, options);

        res.status(200).json({ message: 'data will be updated', success: true });
      } else {
        req.body.hotelData.images = [...req.body.imageUrl];
        req.body.hotelData.message = `I hope this message finds you well.We wanted to inform you that your request to partner with us is currently pending approval from our administrative  team. We understand that waiting can be frustrating, but we want to ensure that we thoroughly review each request to ensure that we maintain the high standards that our customers have come to expect. We appreciate your interest in partnering with us and we look forward to the opportunity to work with you. Once your account is activated, we will inform you promptly and your hotel will become available on our site. We believ that this partnership will be mutually beneficial and we are excited to have you on board.`;
        const email = req.body.hotelData.email;
        const prefix = req.body.hotelData.hotelName;
        let suffix = Math.floor(Math.random() * 1000);
        let uniqueId = `${prefix}_${suffix}`;
        uniqueId = uniqueId.replace(/\s/g, '');
        req.body.hotelData.hotelId = uniqueId;

        const Hotel = new HotelDB(req.body.hotelData);
        await Hotel.save();

        let mailOptions = {
          to: email,
          subject: 'Hotel ID',
          html:
            '<p>Dear user,Your registration is successfully completed: you can sign in with this Hotel ID' +
            "<h3 style='font-weight:bold;'>" +
            uniqueId +
            '</h3>' +
            '<p> Have a Good Day </p>',
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.status(200).json({ message: 'request send to admin', success: true });
      }
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }