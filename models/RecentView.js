import { Schema, model } from "mongoose";

const recentView = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  carrier: { type: Schema.Types.ObjectId, ref: "Carrier", required: true },
  count: { type: Number, default: 1 }
}, {
  collection: "recent_views",
  timestamps: true
});

const RecentView = model("RecentView", recentView);

export default RecentView;