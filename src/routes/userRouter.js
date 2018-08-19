import { Router } from "express";

import jwt from "jsonwebtoken";

import User from "../models/User";

const UserRouter = Router();

UserRouter.post("/register", async (req, res) => {
  // check if already registered
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (user) {
      res.status(400).send({ message: "Email already registered" });
    } else {
      const newUser = new User({ email, password });
      newUser.save();
      res.status(200).send("Registered");
    }
  } catch (e) {
    console.log(e);
    res.status(500).send("Something went wrong.");
  }
});

UserRouter.post("/login", async (req, res) => {
  try {
    const user = await User.findByEmail(req.body.email);
    if (user && (await user.isValidPassword(req.body.password))) {
      const payload = { email: user.email, admin: user.admin };
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1h" });
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
