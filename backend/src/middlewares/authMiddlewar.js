import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

const authenticateToken = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ message: "No token provided" });
  }
  const [bearer, token] = authorization ? authorization.split(" ") : [];
  if (bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const id = jwt.verify(token, JWT_SECRET);
    const user = await findUserById(id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    return next(res.status(401).json({ message: "Invalid or expired token" }));
  }
};

export default authenticateToken;
