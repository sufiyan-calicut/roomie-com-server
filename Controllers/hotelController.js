const HotelDB = require('../Models/hotelSchema');
let notificationDB = require('../Models/notificationSchema.js');
const Room = require('../Models/roomSchema');
module.exports = {
  // hotel sign in
  doLogin: async (req, res) => {
    try {
      const email = req.body.email;
      const hotelID = req.body.hotelID;
      const hotel = await HotelDB.findOne({ $and: [{ email: email }, { HotelId: hotelID }] });
      console.log(req.body);
      console.log(hotel, '<= hotel');
      if (hotel) {
        res.status(200).send({ message: 'login Successfull', success: true, id: hotel._id });
      } else {
        res.status(200).send({ message: 'login failed', success: false });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: 'something went wrong' });
    }
  },
  newRegister: async (req, res) => {
    console.log('inside backend');
    console.log(req.body);

    req.body.hotelData.images = [...req.body.imageUrl];
    console.log('after => ', req.body);

    const Hotel = new HotelDB(req.body.hotelData);

    await Hotel.save().then(async (id) => {
      const notification = new notificationDB({
        type: 'hotel',
        sender: id,
        recipient: id,
        message: 'new hotel registration requiest',
        data: id,
      });

      await notification.save().then(() => {
        console.log(id, '==result');
        res.status(200).send({ message: 'request send to admin', success: true });
      });
    });
  },
  addNewRoom: async (req, res) => {
    try {
      console.log(req.body, '<< requsest');
      req.body.Data.images = req.body.imageUrl;
      let RoomData = await new Room(req.body.Data);
      await RoomData.save().then(() => {
        res.status(200).send({ message: 'new room added successfully', success: true });
      });
    } catch (error) {
      res.status(500).send({ message: 'failed', success: false });
    }
  },
};
