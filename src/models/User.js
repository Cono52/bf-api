import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

mongoose.Promise = global.Promise;

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address"]
  },
  password: { type: String, required: true }
});

UserSchema.pre("save", async function hashPassword(next) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  next();
});

UserSchema.methods.isValidPassword = async function isValidPassword(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

const User = mongoose.model("userSchema", UserSchema, "user");

export default User;
