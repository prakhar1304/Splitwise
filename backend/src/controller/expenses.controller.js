import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js"; // Fixed filename
import { Expense } from "../model/expenses.model.js"; // Fixed variable name
import { asyncHandler } from "../utils/asyncHandler.js";

// 1. Create Expense
const createExpense = asyncHandler(async (req, res) => {
    const { name, amount, description, paidBy, participants } = req.body;

    if (!name || !amount || !paidBy || !participants || participants.length === 0) {
        throw new ApiError(400, "All fields are required and participants cannot be empty");
    }

    console.log(participants);

    const expense = await Expense.create({
        name,
        description,
        amount,
        paidBy,
        participants
    });

    return res.status(201).json(
        new ApiResponse(201, expense, "Expense created successfully")
    );
});

// 2. Get All Expenses
const getAllExpenses = asyncHandler(async (req, res) => {
    const expenses = await Expense.find();
    return res.status(200).json(
        new ApiResponse(200, expenses, "Expenses fetched successfully")
    );
});

// 3. Get Balances
const getBalances = asyncHandler(async (req, res) => {
    const expenses = await Expense.find();
    const balances = {};

    // STEP 1: Calculate balance of each person
    expenses.forEach(expense => {
        const share = expense.amount / expense.participants.length;

        // payer gets money back
        balances[expense.paidBy] =
            (balances[expense.paidBy] || 0) + expense.amount;

        // participants owe their share
        expense.participants.forEach(person => {
            balances[person] =
                (balances[person] || 0) - share;
        });
    });

    // STEP 2: Convert balance object to readable messages
    const result = [];

    for (const person in balances) {
        if (balances[person] < 0) {
            result.push(
                `${person} owes ₹${Math.abs(balances[person]).toFixed(2)}`
            );
        } else if (balances[person] > 0) {
            result.push(
                `${person} should receive ₹${balances[person].toFixed(2)}`
            );
        }
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Simple balances calculated")
    );
});



export {
    createExpense,
    getAllExpenses,
    getBalances
};