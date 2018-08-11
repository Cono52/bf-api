import { Router } from "express";

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

UserRouter.post("/login", (req, res) => {
  res.send({ token: "test" });
});

export default UserRouter;
