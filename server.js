const express = require('express');
const app = express();
// const dbConfig = require('./config/dbConfig.js');
require('dotenv').config();
const userRoute = require('./Routes/userRoutes.js');
const adminRoute = require('./Routes/adminRoute.js');
const hotelRoute = require('./Routes/hotelRoutes.js');
const cors = require('cors');
const { default: mongoose } = require('mongoose');

app.use(express.json());

// const allowedOrigin = 'http://localhost:5000/';
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
  allowedHeaders: ['Content-type', 'Access', 'Authorization'],
};

app.use(cors(corsOptions));

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/hotel', hotelRoute);

mongoose.connect(process.env.MONGO_URL);

const connection = mongoose.connection;

connection.once('open', () => {
  console.log('MongoDB connected successfully');


});
connection.on('error', (err) => {
  console.log('error in mongodb connection', err);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server started on port ${port}`));

// const port = process.env.PORT || 4000;
// app.listen(port, () => console.log(`server started on port ${port}`));
