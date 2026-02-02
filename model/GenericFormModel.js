import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
  formCategory: {
    type: String,
    required: true,
  },
  formPurpose: {
    type: String,
      required: true,
      enum: ['newsletter subscription', 'complaint'],
    default: ""
  },
  formTitle: {
    type: String,
    required: true,
  },
  submittedWhen: {
    type: Date,
    required: true,
    },
    status: {
        type: String,
        enum: ['pendingSubmit','submitted', 'pendingAction', 'fulfilled']
  }
});