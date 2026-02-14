import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    task: String,
    deadline: Date,
    status: {
      type: String,
      enum: ["Not started", "Ongoing", "Completed", "Expired"],
      default: "Not started",
    },
  },
  { timestamps: true },
);