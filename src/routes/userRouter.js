import { Router } from "express";

import jwt from "jsonwebtoken";

import User from "../models/User";

const UserRouter = Router();

UserRouter.post("/register", async (req, res) => {
  // check if already registered
  const user = await User.find({ email: req.body.email });
  if (user) {
    res.status(400).send({ message: "Email already registered" });
  } else {
    res.send("added");
  }
  console.log(user);
  // if not registered then register the person and send them back a login token
});

UserRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user && (await user.isValidPassword(req.body.password))) {
      const token = jwt.sign({ email: user.email, admin: user.admin || undefined }, process.env.SECRET, { expiresIn: "1h" });
      res.send({ token });
    } else {
      res.status(401).send({ message: "The username or password is incorrect" });
    }
  } catch (error) {
    res.status(500).send({ error });
    throw error;
  }
});

export default UserRouter;
