const mongoose = require("mongoose");
require("dotenv").config();



mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.on("connected", () => {
  console.log("mongodb connected successfully");
});

connection.on("error", (err) => {
  console.log("error in mongodb connection", err);
});

module.exports = mongoose;
