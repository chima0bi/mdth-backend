import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
    },
    image: { type: String, default: "" }, // URL from Cloudinary

    // category: {
    //   type: String,
    //   required: [true, "Category is required"],
    // },
    description: {
      type: String,
      default: "",
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    duration: {
      type: String,
      required: [true, "Duration is required"],
      enum: ["1-month", "3-months", "6-months", "1-year"],
    },

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isClassOpen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Course = mongoose.model("Course", courseSchema);

export default Course;
