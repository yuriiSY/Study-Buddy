import jwt from "jsonwebtoken";
import { findUserById } from "../services/authService.js";

const { JWT_SECRET } = process.env;

const authenticateToken = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "No token provided" });
  }

  const [bearer, token] = authorization.split(" ");
  console.log(bearer, token);
  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default authenticateToken;
