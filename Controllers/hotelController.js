const HotelDB = require('../Models/hotelSchema');
let notificationDB = require('../Models/notificationSchema.js');
module.exports = {
  // hotel sign in
  doLogin: async (req, res) => {
    console.log(req.body);
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
};
