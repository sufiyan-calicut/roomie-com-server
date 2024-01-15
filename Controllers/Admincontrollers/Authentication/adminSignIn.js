export const adminSignIn = async (req, res) => {
    try {
      let admin = await userModel.findOne({
        email: req.body.email,
        userType: 'admin',
      });
      if (!admin) {
        return res.status(200).json({ message: 'incorrect email', success: false });
      }
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res.status(200).json({ message: 'incorrect password', success: false });
      } else {
        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });

        res.status(200).json({
          message: 'welcome to admin panel',
          success: true,
          data: adminToken,
        });
      }
    } catch (error) {
      return res.status(500).json({ message: 'error in admin login', success: false });
    }
  }


