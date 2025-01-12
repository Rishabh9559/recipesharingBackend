import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const Schema = mongoose.Schema;

const UserInfo = new Schema({
  FirstName: { type: String, require: true },
  LastName: { type: String, require: true },
  Email: { type: String, require: true, unique: true },
  Password: { type: String, require: true },
  UserID: {
    type: String,
    require: true,
    unique: true,
    index: true,
    lowercase: true,
  },
});

UserInfo.pre("save", async function (next) {
  if (!this.isModified("Password")) return next();
  this.Password = await bcrypt.hash(this.Password, 10);
  next();
});

UserInfo.methods.isPasswordCorrect = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
};

UserInfo.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      Email: this.Email,
      UserID: this.UserID,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("UserInfo", UserInfo);

export { User };
