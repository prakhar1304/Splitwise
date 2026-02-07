import mongoose, { Schema } from "mongoose";

/**
 * splitDetails: each person's fair share (how much they SHOULD pay).
 * amount = fair share, stored as number.
 * For percentage split: convert to amount before saving.
 */
const splitDetailSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

/**
 * Expense schema :
 * - paidBy: who paid the full bill (user ID)
 * - splitDetails: [{ userId, amount }] = fair share per person
 */
const expenseSchema = new Schema(
  {
    description: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
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
