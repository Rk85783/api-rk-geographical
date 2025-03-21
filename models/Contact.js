import { Schema, model } from "mongoose";

const contactSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  companyName: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  role: { type: String, enum: ["Broker", "Shipper", "Carrier", "Other"], required: true },
  isSubscribed: { type: Boolean, default: false },
}, { timestamps: true });

const Contact = model("Contact", contactSchema);
export default Contact;
