import mongoose, { Schema } from "mongoose";

const splitDetailSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

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
    paidByUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    participants: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Level 3: group and advanced split
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
    },
    category: {
      type: String,
      default: "",
    },
    splitType: {
      type: String,
      enum: ["equal", "unequal", "percentage"],
      default: "equal",
    },
    splitDetails: [splitDetailSchema],
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Expense = mongoose.model("Expense", expenseSchema);
