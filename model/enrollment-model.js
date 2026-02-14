import mongoose, { Schema } from "mongoose";

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  enrollmentId: {
    type: Number,
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  completedModules: [
    {
      //TODO:  Edit later so this array correctly references module objects which are a child of particular courses, Eg adding module object to Course model and targetting the module here.
      type: mongoose.Schema.Types.ObjectId.modules,
      ref: "CourseModules",
    },
  ],
  timeSpent: {
    type: Date, //TODO:  Change the type from date to a type that stores time quantities.
  },
  status: {
    type: String,
    enum: [""], // TODO: get a list of possible statuses for enrollment.
    },
    pricePaid: {
        type: mongoose.Schema.Types.ObjectId.amount,
        ref: "Payments"
  }
}, {timestamps: true});