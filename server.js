const express = require("express");
const app = express();
const dbConfig = require("./config/dbConfig.js");
require("dotenv").config();
const userRoute = require("./Routes/userRoutes.js");
const adminRoute = require("./Routes/adminRoute.js")
const hotelRoute = require('./Routes/hotelRoutes.js')
const cors = require("cors");


console.log("inside server")
app.use(express.json());

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
  allowedHeaders:[
    'Content-type',
    'Access',
    'Authorization'
]
};

app.use(cors(corsOptions));

app.use("/api/user", userRoute);
app.use("/api/admin",adminRoute);
app.use("/api/hotel",hotelRoute);


const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`server started on port ${port}`));
