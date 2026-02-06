import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { Expense } from "../model/expenses.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createExpense = asyncHandler(async (req, res) => {
  const { name, amount, description, paidBy, participants } = req.body;

  if (!name || amount == null || !paidBy || !participants || participants.length === 0) {
    throw new ApiError(400, "Name, amount, paidBy and participants (non-empty) are required");
  }

  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const expense = await Expense.create({
    name,
    description: description || "",
    amount: Number(amount),
    paidBy,
    participants,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully"));
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ createdBy: req.user._id }).sort({
    createdAt: -1,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    createdBy: req.user._id,
  });

  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});

const getBalances = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ createdBy: req.user._id });
  const balances = {};

  expenses.forEach((expense) => {
    const share = expense.amount / expense.participants.length;
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    expense.participants.forEach((person) => {
      balances[person] = (balances[person] || 0) - share;
    });
  });

  const creditors = [];
  const debtors = [];
  for (const person in balances) {
    if (balances[person] > 0.01) {
      creditors.push({ name: person, amount: balances[person] });
    } else if (balances[person] < -0.01) {
      debtors.push({ name: person, amount: Math.abs(balances[person]) });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({
      sender: debtors[i].name,
      receiver: creditors[j].name,
      amount: parseFloat(amount.toFixed(2)),
      statement: `${debtors[i].name} owes ${creditors[j].name} ₹${amount.toFixed(2)}`,
    });
    debtors[i].amount -= amount;
    creditors[j].amount -= amount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, settlements, "Settlements calculated successfully"));
});

export { createExpense, getAllExpenses, deleteExpense, getBalances };
