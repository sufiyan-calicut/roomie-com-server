const express = require('express');
const userController = require('../Controllers/userController');
const router = express.Router();
const authMiddleware = require('../Middlewares/authMiddleware.js');

// ...................................................AUTHENTICATION ROUTES................................
router.post('/sendOtp', userController.sendOtp);
router.post('/doLogin', userController.doLogin);
router.post('/resendOtp', userController.resendOtp);
router.post('/verifyOtp', userController.verifyOtp);
router.post('/get-user-info', userController.getUserInfo);
router.post('/reset-password', userController.resetPassword);
router.post('/verify-reset-otp', userController.verifyResetOtp);
router.post('/update-new-password', userController.updateNewPassword);
router.get('/authenticate', userController.checkAuth);

// ....................................................HOTELS_DISPLAY_RELATED...................................

router.post('/display-rooms', userController.displayRooms);
router.post('/fetch-single-room-data', authMiddleware, userController.fetchSingleHotelData);
// router.get('/fetch-hotel-image/:id', userController.fetchHotelImage)

// ..................................................SEARCH_QUERY....................................

router.post('/fetch-search-data', userController.fetchSearchData);

// .................................................BOOKING_RELATED.....................................

router.get('/fetch-all-bookings', authMiddleware, userController.fetchBookings);
router.post('/fetch-search-book', authMiddleware, userController.searchBooking);
router.post('/cancel-booking', authMiddleware, userController.cancellBooking);
router.get('/fetch-wallet-history', authMiddleware, userController.fetchWalletHistory);
router.get('/fetchProfileData', authMiddleware, userController.fetchProfileData);
router.post('/walletPayment', authMiddleware, userController.walletPayment);

// .................................................BOOKING_CONFIRMATION AND PAYMENT_RELATED..................................

router.post('/initializePayment', authMiddleware, userController.initializePayment);
router.post('/verifyPayment', authMiddleware, userController.verifyPayment);

module.exports = router;
