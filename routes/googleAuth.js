import jwt from "jsonwebtoken";
import User from "../models/User.js";

const googleAuth = async (req, res) => {
  const { email, name } = req.body;
  console.log("--------email: ",email);
  console.log("--------name: ",name);

  if (!email) {
    return res.status(400).json({ error: "Email requerido" });
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
      enabled: true,
      deleted: false,
    });
  }

  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  
  console.log("------------token: ",token);

  return res.json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token,
  });
};

export default googleAuth;