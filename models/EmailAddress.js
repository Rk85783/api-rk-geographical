import { Schema, model } from "mongoose";

const emailAddressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  email: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

const EmailAddress = model("EmailAddress", emailAddressSchema);
export default EmailAddress;