const express = require("express");
const authmiddleware = require("../Middlewares/authMiddleware");
const router = express.Router();
const userModel = require("../Models/userModel");
const adminControllers = require("../Controllers/adminControllers");

router.get("/allUsers", async (req, res) => {
  const allUser = await userModel.find();
  console.log(allUser);
  res.status(200).json({ allUser });
});

router.post("/admin-sign-in", adminControllers.adminSignIn);

router.post("/add-room", adminControllers.addRoom);

router.get("/get-hotel-data", adminControllers.getHotelData);

router.get("/new-hotel-requests", adminControllers.newHotelRequests);

router.post("/decline-hotel-request", adminControllers.declineHotelRequest);

router.post("/accept-hotel-request", adminControllers.acceptHotelRequest);

router.get("/get-all-hotelData", adminControllers.getHotelsData)

router.put("/change-hotel-status", adminControllers.changeHotelStatus)
router.get("/get-all-users", async (req, res) => {
  try {
    const users = await userModel.find({ isAdmin: false });
    if (!users) {
      return res
        .status(200)
        .send({ message: "no users exist", success: false });
    }
    console.log(users);
    // return res.status(200).json(users)
    res.status(200).send({
      message: "users fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error applying users list", success: false, error });
  }
});

router.post("/change-user-status", authmiddleware, async (req, res) => {
  try {
    const temp = req.body;
    const id = temp.record._id;

    const userdata = await userModel.find({ _id: id }, { isAdmin: false });
    const user = userdata[0];
    console.log("inside admin route", user.block);

    if (user.block) {
      user.block = false;
    } else {
      user.block = true;
    }
    await user.save();
    const allUsers = await userModel.find({ isAdmin: false });
    res.status(200).send({
      message: `user ${user.block ? "blocked" : "unblocked"} successfully`,
      success: true,
      data: allUsers,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error applying users list", success: false, error });
  }
});

router.get("/admin-auth", adminControllers.checkAuth);

module.exports = router;
