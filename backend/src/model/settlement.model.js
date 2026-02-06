import mongoose, { Schema } from "mongoose";

const settlementSchema = new Schema(
  {
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    groupId: { type: Schema.Types.ObjectId, ref: "Group", default: null },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SettlementRecord = mongoose.model("SettlementRecord", settlementSchema);
