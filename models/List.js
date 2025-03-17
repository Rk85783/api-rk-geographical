import { Schema, model } from "mongoose";

const listSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  name: { type: String, required: true },
  isPrimary: { type: Boolean, default: false },
  carriers: [{ type: Schema.Types.ObjectId, ref: "Carrier" }]
}, { timestamps: true });

const List = model("List", listSchema);

export default List;