const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const userModel = require("../Models/userModel");
const Room = require("../Models/roomSchema");

module.exports = {
  adminSignIn: async (req, res) => {
    try {
      console.log(req.body.email);
      let admin = await userModel.findOne({ email: req.body.email,isAdmin:true });
      if(!admin){
        return res
        .status(200).send({message:'incorrect email',success:false})
      }
      const isMatch = await bcrypt.compare(req.body.password, admin.password);
      if (!isMatch) {
        return res
          .status(200)
          .send({ message: "incorrect password", success: false });
      } else {
        console.log("token", process.env.JWT_SECRET);

        const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });

        res
          .status(200)
          .send({ message: "welcome to admin panel", success: true, data: adminToken });
      }
    } catch (error) {
      console.log(error);
      return res
      .status(500)
      .send({ message: "error in admin login", success: false });
    }
  },
  checkAuth:  (req, res) => {
    console.log('inside check auth')
    let adminToken = req.headers?.authorization
   
    try {
        if (adminToken) {
            jwt.verify(adminToken, process.env.JWT_SECRET, (err, result) => {
                if (err) {
                  console.log(err)
                    res.status(200).send({message: 'authentication failed',success:false} )
                } else {
                  console.log("decoded completed")
                  console.log(result.id)

                    userModel
                        .findOne({ _id: result.id })
                        .then((user) => {
                          console.log('after fetching from db')
                            if (user) {
                              console.log(user)
                                if (user.isAdmin) {
                                    res.status(200).json({ authorization: true })
                                } else {
                                    res.status(401).json({ authorization: false })
                                }
                            } else {
                                res.status(401).json({ authorization: false })
                            }
                        })
                }
            })
        } else {
            res.status(401).json({ authorization: false })
        }
    } catch (err) {
        res.status(401).json({ authorization: false })
    }
},
addRoom : async (req, res) => {

try {

  console.log(req.body ,"body")
 req.body.roomData.images = req.body.imageUrl
  console.log(req.body.roomData, " romm datata" );
  
  const newRoom = new Room(req.body.roomData)
  await newRoom.save().then(()=>{
    res.status(200).send({message:"New room added successfully",success:true})
  }).catch((err) => {
    console.log(err)
    res.status(200).send({message: "failed! ensure all data is given",success:false})
  })
  
} catch (error) {
  console.log(error);
  res.status(500).send({message:"Something went wrong",success:false})
}


},
getHotelData : async (req, res) => {
  console.log("inside hotel function")
  const hoteldata = await Room.find()
  console.log(hoteldata,"hotel data")
  res.status(200).send(hoteldata)
}
};
   