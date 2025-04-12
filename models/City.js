import { Schema, model } from "mongoose";

const citySchema = new Schema({});

const City = model("City", citySchema);
export default City;