import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import * as authService from "../services/authService.js";

const { JWT_SECRET } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.findUserByEmail(email);

  if (user) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await authService.signup({
    ...req.body,
    password: hashPassword,
  });

  res.status(201).json({
    username: newUser.name,
    email: newUser.email,
  });
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.findUserByEmail(email);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const { id: id } = user;

  const payload = {
    id,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });

  res.json({
    user: {
      username: user.name,
      email: user.email,
    },
    token,
  });
};

export default {
  signup,
  signin,
};
