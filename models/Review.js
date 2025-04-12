import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    carrier: { type: Schema.Types.ObjectId, ref: "Carrier", required: true },
    "Title (Optional)": { type: String },
    "Would you work with this carrier again?": { type: Boolean, required: true },
    "What went well": [{ type: String, required: true }],
    "What went poorly": [{ type: String, required: true }],
    "Would you like to receive availability updates for this carrier? (Optional)": { type: Boolean },
    "Tell us about your overall experience working with this carrier": { type: String, required: true },
    "When did you last work with this carrier?": {
      month: { type: String, required: true },
      year: { type: Number, required: true }
    },
    "How did you find this carrier?": { type: String },
    "How was the carrier's rate?": { type: String, required: true },
    "How often have you worked with this carrier?": { type: String, required: true },
    "What lanes did this carrier run?": [
      {
        pickup: { type: String, required: true },
        dropoff: { type: String, required: true }
      }
    ],
    "Timeliness": { type: Number, required: true, min: 1, max: 10 },
    "Quality of Equipment": { type: Number, required: true, min: 1, max: 10 },
    "Communication": { type: Number, required: true, min: 1, max: 10 },
    "What type(s) of freight did you ship?": [{ type: String, required: true }],
    "What type(s) of truck did you use?": [{ type: String, required: true }],
    "What type(s) of shipments did this carrier take?": [{ type: String, required: true }],
    "What specialized services did this carrier provide? (Optional)": [{ type: String }],
    "Did this carrier use electronic tracking?": { type: Boolean, required: true },
    "Did the tracking work throughout the duration of their haul?": { type: Boolean },
    "Add a verification screenshot": String,
    "Is your brokerage related to this carrier in any way?": { type: Boolean, required: true },
    "Are you willing to be a reference for this carrier?": { type: Boolean, required: true },
    "I would like my review to be anonymous.": { type: Boolean, required: true },
  },
  { timestamps: true }
);

const Review = model("Review", reviewSchema);

export default Review;
