import { Schema, model } from "mongoose";

const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["admin", "carrier", "shipper", "broker", "dispatcher", "broker"], required: true }
}, { timestamps: true });

const User = model("User", userSchema);

export default User;