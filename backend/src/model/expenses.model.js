import mongoose, { Schema } from "mongoose";

const expenseSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paidBy: {
        type: String,
        required: true
    },
    participants:
    {
        type: [String],
        required: true
    },

})


export const Expense = mongoose.model("Expense", expenseSchema)