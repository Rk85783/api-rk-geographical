import { Schema, model } from "mongoose";

const shipperSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  companyName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
}, { timestamps: true });

const Shipper = model("Shipper", shipperSchema);

export default Shipper;
