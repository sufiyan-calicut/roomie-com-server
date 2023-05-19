const express = require('express');
const authmiddleware = require('../Middlewares/adminAuth');
const router = express.Router();
const userModel = require('../Models/userModel');
const adminControllers = require('../Controllers/adminControllers');

// ............................................ADMIN_AUTH_ROUTES........................................
router.get('/admin-auth', authmiddleware, adminControllers.checkAuth);
router.post('/admin-sign-in', adminControllers.adminSignIn);

// ............................................HOTEL_RELATED_ROUTES........................................
router.get('/new-hotel-requests', authmiddleware, adminControllers.newHotelRequests);
router.post('/decline-hotel-request', authmiddleware, adminControllers.declineHotelRequest);
router.post('/accept-hotel-request', authmiddleware, adminControllers.acceptHotelRequest);
router.get('/get-all-hotelData', authmiddleware, adminControllers.getHotelsData);
router.put('/change-hotel-status', authmiddleware, adminControllers.changeHotelStatus);
router.get('/fetch-hotel-counts', authmiddleware, adminControllers.fetchHotelCounts);

// ............................................BOOKINGS_RELATED_ROUTES........................................
router.post('/fetch-bookings', authmiddleware, adminControllers.fetchBookings);
router.put('/change-status', authmiddleware, adminControllers.changeBookingStatus);
router.get('/get-data-counts', authmiddleware, adminControllers.fetchBookingCounts);
router.post('/search-bookings', authmiddleware, adminControllers.searchBooking);

// ............................................CUSTOMER_RELATED_ROUTES........................................
router.get('/get-all-users', authmiddleware, adminControllers.fetchAllUsers);

// ............................................SALES_RELATED_ROUTES........................................
router.post(`/fetch-sales-data`, authmiddleware, adminControllers.fetchSalesData);
router.post('/change-user-status', authmiddleware, adminControllers.changeUserStatus);

// ............................................OTHER_ROUTES........................................
router.get('/fetch-data-counts', authmiddleware, adminControllers.fetchDataCounts);
router.get('/fetch-graph-data', authmiddleware, adminControllers.fetchDataforGraph);

module.exports = router;
