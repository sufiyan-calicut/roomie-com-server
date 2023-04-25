const express = require('express');
const router = express.Router();
const hotelController = require('../Controllers/hotelController');

// hotel sign in
router.post('/hotelLogin', hotelController.doLogin);
router.post('/newRegistration', hotelController.newRegister);
router.post('/addNewRoom',hotelController.addNewRoom);

module.exports = router;
