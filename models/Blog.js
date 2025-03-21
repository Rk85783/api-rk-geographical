import { Schema, model } from "mongoose";

const blogSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  featuredImage: { type: String, default: 'https://placehold.co/600x400' },
}, { timestamps: true });

const Blog = model("Blog", blogSchema);
export default Blog;