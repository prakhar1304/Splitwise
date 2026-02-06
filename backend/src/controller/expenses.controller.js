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

    // STEP 1: Calculate net balance for each person
    expenses.forEach(expense => {
        const share = expense.amount / expense.participants.length;

        balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;

        expense.participants.forEach(person => {
            balances[person] = (balances[person] || 0) - share;
        });
    });

    // STEP 2: Separate into creditors and debtors
    const creditors = [];
    const debtors = [];

    for (const person in balances) {
        if (balances[person] > 0.01) {
            creditors.push({ name: person, amount: balances[person] });
        } else if (balances[person] < -0.01) {
            debtors.push({ name: person, amount: Math.abs(balances[person]) });
        }
    }

    // Sort to handle largest amounts first 
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // STEP 3: Match debtors with creditors
    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
        const amount = Math.min(debtors[i].amount, creditors[j].amount);

        settlements.push({
            sender: debtors[i].name,
            receiver: creditors[j].name,
            amount: parseFloat(amount.toFixed(2)),
            statement: `${debtors[i].name} owes ${creditors[j].name} ₹${amount.toFixed(2)}`
        });

        debtors[i].amount -= amount;
        creditors[j].amount -= amount;

        if (debtors[i].amount < 0.01) i++;
        if (creditors[j].amount < 0.01) j++;
    }

    return res.status(200).json(
        new ApiResponse(200, settlements, "Settlements calculated successfully")
    );
});



export {
    createExpense,
    getAllExpenses,
    getBalances
};