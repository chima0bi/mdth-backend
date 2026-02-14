import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["video", "announcement", "textArticle", "resource"],
      required: true,
    },
    category: {
      type: String,
    },
    fields: mongoose.Schema.Types.Mixed,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
  },
  { timestamps: true },
);

const Content = mongoose.model("Content", contentSchema);

export default Content;
