const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const hotelToken = req.headers['authorization'].split(' ')[1];
    jwt.verify(hotelToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Auth failed',
          success: false,
        });
      } else {
        req.body.hotelId = decoded.id;
        next();
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Auth failed', success: false });
  }
};
