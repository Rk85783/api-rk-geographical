import { Schema, model } from "mongoose";

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "user", "carrier", "shipper", "broker", "dispatcher", "broker"], default: "user" },
  emailOtp: Number,
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const User = model("User", userSchema);

export default User;