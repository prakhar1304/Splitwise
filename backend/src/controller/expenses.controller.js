import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { Expense } from "../model/expenses.model.js";
import { Group } from "../model/group.model.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { optimizeSettlements, computeBalancesFromExpenses } from "../service/settlement.js";

const createExpense = asyncHandler(async (req, res) => {
  const {
    name,
    amount,
    description,
    paidBy,
    paidByUser,
    participants,
    groupId,
    category,
    splitType,
    splitDetails,
    participantIds,
    date,
  } = req.body;

  if (!name || amount == null || !paidBy) {
    throw new ApiError(400, "Name, amount and paidBy are required");
  }
  if (amount <= 0) {
    throw new ApiError(400, "Amount must be greater than 0");
  }

  const numAmount = Number(amount);
  let finalSplitDetails = [];
  let finalPaidByUser = paidByUser ? paidByUser : null;

  if (groupId) {
    const group = await Group.findById(groupId);
    if (!group) throw new ApiError(404, "Group not found");
    const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) throw new ApiError(403, "You are not a member of this group");

    finalPaidByUser = paidByUser || req.user._id;
    const stype = splitType || "equal";

    if (stype === "equal") {
      const pids = Array.isArray(participantIds) ? participantIds : [];
      if (pids.length === 0) {
        throw new ApiError(400, "For group equal split, participantIds (user IDs) are required");
      }
      const share = parseFloat((numAmount / pids.length).toFixed(2));
      finalSplitDetails = pids.map((uid) => ({ userId: uid, amount: share }));
    } else if (stype === "unequal" || stype === "percentage") {
      const details = Array.isArray(splitDetails) ? splitDetails : [];
      const sum = details.reduce((s, d) => s + (Number(d.amount) || 0), 0);
      if (Math.abs(sum - numAmount) > 0.02) {
        throw new ApiError(400, `Split details total (${sum}) must equal expense amount (${numAmount})`);
      }
      finalSplitDetails = details.map((d) => ({
        userId: d.userId,
        amount: Number(d.amount) || 0,
      }));
    } else {
      throw new ApiError(400, "Invalid splitType");
    }
  } else {
    if (!participants || participants.length === 0) {
      throw new ApiError(400, "Participants (non-empty) are required for non-group expense");
    }
  }

  const expense = await Expense.create({
    name,
    description: description || "",
    amount: numAmount,
    paidBy,
    paidByUser: finalPaidByUser,
    participants: participants || [],
    createdBy: req.user._id,
    groupId: groupId || null,
    category: category || "",
    splitType: splitType || "equal",
    splitDetails: finalSplitDetails,
    date: date ? new Date(date) : undefined,
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

const getExpensesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");
  const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, "You are not a member of this group");

  const expenses = await Expense.find({ groupId }).sort({ date: -1, createdAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Group expenses fetched successfully"));
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const isOwner = expense.createdBy.toString() === req.user._id.toString();
  let isGroupMember = false;
  if (expense.groupId) {
    const group = await Group.findById(expense.groupId);
    if (group) {
      isGroupMember = group.members.some((m) => m.toString() === req.user._id.toString());
    }
  }
  if (!isOwner && !isGroupMember) {
    throw new ApiError(403, "You can only view your own expense or one in your group");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const isOwner = expense.createdBy.toString() === req.user._id.toString();
  let isGroupMember = false;
  if (expense.groupId) {
    const group = await Group.findById(expense.groupId);
    if (group) {
      isGroupMember = group.members.some((m) => m.toString() === req.user._id.toString());
    }
  }
  if (!isOwner && !isGroupMember) {
    throw new ApiError(403, "You can only update your own expense or one in your group");
  }

  const allowed = [
    "name",
    "description",
    "amount",
    "paidBy",
    "paidByUser",
    "participants",
    "category",
    "splitType",
    "splitDetails",
    "date",
  ];
  const body = req.body;
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === "amount") update.amount = Number(body[key]);
      else if (key === "date") update.date = body[key] ? new Date(body[key]) : expense.date;
      else update[key] = body[key];
    }
  }
  if (body.participantIds !== undefined && expense.groupId && (expense.splitType === "equal" || update.splitType === "equal")) {
    const pids = Array.isArray(body.participantIds) ? body.participantIds : [];
    const amt = update.amount ?? expense.amount;
    if (pids.length > 0) {
      const share = parseFloat((amt / pids.length).toFixed(2));
      update.splitDetails = pids.map((uid) => ({ userId: uid, amount: share }));
    }
  }

  const updated = await Expense.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
  return res.status(200).json(new ApiResponse(200, updated, "Expense updated successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) throw new ApiError(404, "Expense not found");

  const isOwner = expense.createdBy.toString() === req.user._id.toString();
  let isGroupMember = false;
  if (expense.groupId) {
    const group = await Group.findById(expense.groupId);
    if (group) {
      isGroupMember = group.members.some((m) => m.toString() === req.user._id.toString());
    }
  }
  if (!isOwner && !isGroupMember) {
    throw new ApiError(403, "You can only delete your own expense or one in your group");
  }

  await Expense.findByIdAndDelete(req.params.id);
  return res.status(200).json(new ApiResponse(200, null, "Expense deleted successfully"));
});

const getBalances = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ createdBy: req.user._id });
  const balances = {};

  expenses.forEach((expense) => {
    const share = expense.amount / (expense.participants?.length || 1);
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + expense.amount;
    (expense.participants || []).forEach((person) => {
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

const getBalancesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, "Group not found");
  const isMember = group.members.some((m) => m.toString() === req.user._id.toString());
  if (!isMember) throw new ApiError(403, "You are not a member of this group");

  const expenses = await Expense.find({ groupId }).select("amount paidByUser splitDetails");
  const balanceMap = computeBalancesFromExpenses(expenses);

  const userIds = [...new Set([...balanceMap.keys(), ...group.members.map((m) => m.toString())])];
  const users = await User.find({ _id: { $in: userIds } }).select("_id name").lean();
  const idToName = {};
  users.forEach((u) => {
    idToName[u._id.toString()] = u.name;
  });

  const balances = [];
  balanceMap.forEach((balance, userId) => {
    if (Math.abs(balance) < 0.01) return;
    balances.push({
      userId,
      name: idToName[userId] || userId,
      balance,
    });
  });

  const settlements = optimizeSettlements(balances, {
    idKey: "userId",
    nameKey: "name",
    balanceKey: "balance",
  });

  const result = settlements.map((s) => ({
    sender: s.fromName,
    receiver: s.toName,
    amount: s.amount,
    statement: s.statement,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Group settlements calculated successfully"));
});

export {
  createExpense,
  getAllExpenses,
  getExpensesByGroup,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getBalances,
  getBalancesByGroup,
};
