const express = require('express');
const router = express.Router();
const hotelController = require('../Controllers/hotelController');
const hotelAuth = require('../Middlewares/hotelAuthMiddleWare.js');

// .....................................AUTHENTICATION_ROUTES..........................
router.post('/hotelLogin', hotelController.doLogin);
router.post('/newRegistration', hotelController.newRegister);
router.get('/hotel-auth', hotelController.hotelAuth);
router.post('/fetch-hotel-data', hotelAuth, hotelController.fetchHotelData);

// .............................................BOOKING...................................
router.post('/search-bookings', hotelAuth, hotelController.searchBooking);
router.post('/get-new-requests', hotelAuth, hotelController.getNewRequests);
router.put('/accept-booking', hotelAuth, hotelController.acceptBooking);
router.get('/fetch-upcoming-bookings', hotelAuth, hotelController.fetchUpcomingBookings);
router.get('/fetch-expired-bookings', hotelAuth, hotelController.fetchExpiredBookings);
router.get('/fetch-current-bookings', hotelAuth, hotelController.fetchCurrentBookings);
router.put('/decline-booking', hotelAuth, hotelController.declineBooking);
router.get('/fetch-cancelled-bookings', hotelAuth, hotelController.fetchCancelledBookings);
router.get('/get-data-counts', hotelAuth, hotelController.fetchBookingCounts);
router.put('/change-status', hotelAuth, hotelController.changeBookingStatus);

// ................................................SALES_RELATED............................
router.get('/fetch-data-counts', hotelAuth, hotelController.fetchDataCounts);
router.post(`/fetch-sales-data`, hotelAuth, hotelController.fetchSalesData);
router.get('/fetch-graph-data', hotelAuth, hotelController.fetchDataforGraph);

module.exports = router;
