import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  coursesEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  assignments: [
    {
      Assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignments" },  
    },
  ],
  progress: {
    type: Number,
  },
  resources: [
    {
      resource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resources",
      },
    },
  ],
  certificates: [
    {
      certificate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Certificate",
      },
    },
  ],
  activiies: [
    {
      activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
    },
    ],
    notificatons: [String]
});
