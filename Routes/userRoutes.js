const express = require("express");
const userController = require("../Controllers/userController");
const router = express.Router();
const authMiddleWare = require("../Middlewares/authMiddleware");

router.post("/sendOtp", userController.sendOtp);
router.post("/verifyOtp", userController.verifyOtp);
router.post("/doLogin", userController.doLogin);
router.post("/resendOtp", userController.resendOtp);
router.post("/get-user-info", userController.getUserInfo);
router.post("/reset-password",userController.resetPassword)
router.post("/verify-reset-otp",userController.verifyResetOtp)
router.post("/update-new-password",userController.updateNewPassword)

router.get("/authenticate", userController.checkAuth);

module.exports = router;
