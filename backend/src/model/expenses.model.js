import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: String,
      required: true,
    },
    participants: {
      type: [String],
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);
