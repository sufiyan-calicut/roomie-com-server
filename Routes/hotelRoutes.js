const express = require("express");
const router = express.Router();
const hotelController = require ('../Controllers/hotelController')

// hotel sign in
router.post('/doLogin',hotelController.doLogin)
router.post("/newRegistration",hotelController.newRegister)

module.exports = router