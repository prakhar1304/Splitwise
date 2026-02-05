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


    const share = amount / participants.length;


    const participantsWithShare = participants.map(pName => ({
        name: pName,
        amount: share
    }));

    const expense = await Expense.create({
        name,
        description,
        amount,
        paidBy,
        participants: participantsWithShare
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
const getBalances = async (req, res) => {
    const expenses = await Expense.find();
    const balances = {};

    // STEP 1: Net balance calculation
    expenses.forEach(expense => {
        const share = expense.amount / expense.participants.length;

        // credit payer
        balances[expense.paidBy] =
            (balances[expense.paidBy] || 0) + expense.amount;

        // debit participants
        expense.participants.forEach(name => {
            balances[name] = (balances[name] || 0) - share;
        });
    });

    // STEP 2: Very simple settlement
    const result = [];
    const people = Object.keys(balances);

    people.forEach(p1 => {
        if (balances[p1] < 0) {
            people.forEach(p2 => {
                if (balances[p2] > 0 && balances[p1] !== 0) {
                    const amount = Math.min(
                        Math.abs(balances[p1]),
                        balances[p2]
                    );

                    if (amount > 0) {
                        result.push(`${p1} owes ${p2} ₹${amount.toFixed(2)}`);
                        balances[p1] += amount;
                        balances[p2] -= amount;
                    }
                }
            });
        }
    });

    res.json(result);
};


export {
    createExpense,
    getAllExpenses,
    getBalances
};