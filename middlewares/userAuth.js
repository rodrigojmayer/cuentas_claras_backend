// import { decode } from "next-auth/jwt";
import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("authHeader: ",authHeader);
  
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token requerido" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    console.log("decoded????????????????????????????????: ")
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("decoded: ", decoded)
    // decoded = { _id, email, iat, exp }
    req.user = decoded;
    
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default userAuth;