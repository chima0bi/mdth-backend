import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    attempts: Number,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    provider: String,
    amount: {
      type: BigInt,
    },
    currencyCode: {
      type: String,
      enum: ["NGN", "USD", "EUR", "GBP"],
    },
    status: {
      type: String,
      enum: ["processing", "successful", "declined"],
    },
  },
  { timestamps: true },
);
