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

UserSchema.statics.findByEmail = function findByEmail(email) {
  return User.findOne({ email }).exec();
};

UserSchema.methods.isValidPassword = function isValidPassword(password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

const User = mongoose.model("userSchema", UserSchema, "user");

export default User;
