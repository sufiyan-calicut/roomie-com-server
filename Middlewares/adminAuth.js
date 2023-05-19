const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  try {
    const adminToken = req.headers['authorization'].split(' ')[1];
    jwt.verify(adminToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Auth failed',
          success: false,
        });
      } else {
        next();
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Auth failed', success: false });
  }
};
