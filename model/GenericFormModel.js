import mongoose from "mongoose";
import { type } from "os";

const formSchema = new mongoose.Schema(
  {
    formCategory: {
      type: String,
      required: true,
    },
    pageUrl: {
      type: String,
    },
    fields: mongoose.Schema.Types.Mixed,
    formPurpose: {
      type: String,
      required: true,
      enum: ["newsletter subscription", "complaint"],
      default: "",
    },
    formTitle: {
      type: String,
      required: true,
    },
    submittedWhen: {
      type: Date,
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    ip: String,
    userAgent: String,
    status: {
      type: String,
      enum: ["pendingAction", "fulfilled"],
      default: "pendingAction"
    },
  },
  { timestamps: true },
);

const NonCoreForms = mongoose.model("NonCoreForms", formSchema);

export default NonCoreForms;
