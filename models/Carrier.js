import { Schema, model } from "mongoose";

const carrierSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  legalName: { type: String, required: true },
  phyCity: { type: String, required: true },
  phyState: { type: String, required: true },
  phyCountry: { type: String, required: true },
}, { timestamps: true });

const Carrier = model("Carrier", carrierSchema);

export default Carrier;
