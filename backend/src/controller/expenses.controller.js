import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiRes.js';
import { Expense } from '../model/expenses.model.js';
import { Group } from '../model/group.model.js';
import { User } from '../model/user.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const RESERVED_IDS = ['analytics', 'balances', 'group'];
import {
  optimizeSettlements,
  computeBalancesFromExpenses,
} from '../service/settlement.js';

/**
 * Create expense - paidBy and splitDetails use userId (ObjectId).
 * splitDetails.amount = fair share per person.
 */
const createExpense = asyncHandler(async (req, res) => {
  const {
    description,
    amount,
    paidBy,
    groupId,
    category,
    splitType,
    splitDetails,
    participantIds,
    date,
  } = req.body;

  if (!description || amount == null) {
    throw new ApiError(400, 'Description and amount are required');
  }
  if (amount <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  const numAmount = Number(amount);
  let finalPaidBy = paidBy || req.user._id;
  let finalSplitDetails = [];

  if (groupId) {
    const group = await Group.findById(groupId);

    if (!group) throw new ApiError(404, 'Group not found');

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (!isMember)
      throw new ApiError(403, 'You are not a member of this group');

    finalPaidBy = paidBy || req.user._id;
    const stype = splitType || 'equal';

    if (stype === 'equal') {
      const pids = Array.isArray(participantIds) ? participantIds : [];

      if (pids.length === 0) {
        throw new ApiError(
          400,
          'For group equal split, participantIds (user IDs) are required'
        );
      }

      const share = parseFloat((numAmount / pids.length).toFixed(2));

      finalSplitDetails = pids.map((uid) => ({ userId: uid, amount: share }));
    } 
    else if (stype === 'unequal' || stype === 'percentage') 
    {
      const details = Array.isArray(splitDetails) ? splitDetails : [];

      const sum = details.reduce((s, d) => s + (Number(d.amount) || 0), 0);

      // console.log("sum", sum);
      // console.log("numAmount", numAmount);

      if (Math.abs(sum - numAmount) > 0.02) {
        throw new ApiError(
          400,
          `Split details total (${sum}) must equal expense amount (${numAmount})`
        );
      }

      finalSplitDetails = details.map((d) => ({
        userId: d.userId,
        amount: Number(d.amount) || 0,
      }));
    } else {
      throw new ApiError(400, 'Invalid splitType');
    }
  } else {
    finalPaidBy = paidBy || req.user._id;
    if (
      !participantIds?.length &&
      (!splitDetails || splitDetails.length === 0)
    ) {
      throw new ApiError(
        400,
        'participantIds or splitDetails required for non-group expense'
      );
    }
    if (participantIds?.length) {
      const share = parseFloat((numAmount / participantIds.length).toFixed(2));
      finalSplitDetails = participantIds.map((uid) => ({
        userId: uid,
        amount: share,
      }));
    } else {
      const sum = splitDetails.reduce((s, d) => s + (Number(d.amount) || 0), 0);
      if (Math.abs(sum - numAmount) > 0.02) {
        throw new ApiError(
          400,
          `Split details total (${sum}) must equal expense amount (${numAmount})`
        );
      }
      finalSplitDetails = splitDetails.map((d) => ({
        userId: d.userId,
        amount: Number(d.amount) || 0,
      }));
    }
  }

  const expense = await Expense.create({
    description: description || '',
    amount: numAmount,
    paidBy: finalPaidBy,
    createdBy: req.user._id,
    groupId: groupId || null,
    category: category || '',
    splitType: splitType || 'equal',
    splitDetails: finalSplitDetails,
    date: date ? new Date(date) : undefined,
  });

  const populated = await Expense.findById(expense._id)
    .populate('paidBy', 'name email')
    .populate('splitDetails.userId', 'name')
    .populate('createdBy', 'name')
    .populate('groupId', 'name');

  return res
    .status(201)
    .json(new ApiResponse(201, populated, 'Expense created successfully'));
});

/**
 * Get all expenses: created by user OR in groups user belongs to.
 */
const getAllExpenses = asyncHandler(async (req, res) => {
  const userGroups = await Group.find({ members: req.user._id }).select('_id');
  const groupIds = userGroups.map((g) => g._id);

  const expenses = await Expense.find({
    $or: [{ createdBy: req.user._id }, { groupId: { $in: groupIds } }],
  })
    .populate('paidBy', 'name email')
    .populate('splitDetails.userId', 'name')
    .populate('createdBy', 'name')
    .populate('groupId', 'name')
    .sort({ date: -1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, 'Expenses fetched successfully'));
});

const getExpensesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  const isMember = group.members.some(
    (m) => m.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'You are not a member of this group');

  const expenses = await Expense.find({ groupId })
    .populate('paidBy', 'name email')
    .populate('splitDetails.userId', 'name')
    .populate('createdBy', 'name')
    .populate('groupId', 'name')
    .sort({ date: -1, createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, expenses, 'Group expenses fetched successfully')
    );
});

const getExpenseById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (RESERVED_IDS.includes(id)) {
    throw new ApiError(
      400,
      `"${id}" is a reserved path, not an expense ID. Did you mean GET /api/expenses/${id}?`
    );
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid expense ID format: "${id}"`);
  }
  const expense = await Expense.findById(id)
    .populate('paidBy', 'name email')
    .populate('splitDetails.userId', 'name')
    .populate('createdBy', 'name')
    .populate('groupId', 'name');

  if (!expense) throw new ApiError(404, 'Expense not found');

  const createdById =
    expense.createdBy?._id?.toString() || expense.createdBy?.toString();
  const isOwner = createdById === req.user._id.toString();
  let isGroupMember = false;
  const groupIdForCheck = expense.groupId?._id || expense.groupId;
  if (groupIdForCheck) {
    const group = await Group.findById(groupIdForCheck);
    if (group) {
      isGroupMember = group.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
    }
  }
  if (!isOwner && !isGroupMember) {
    throw new ApiError(
      403,
      'You can only view your own expense or one in your group'
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, expense, 'Expense fetched successfully'));
});

const updateExpense = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (RESERVED_IDS.includes(id) || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid expense ID: "${id}"`);
  }
  const expense = await Expense.findById(id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  const isOwner =
    expense.createdBy &&
    expense.createdBy.toString() === req.user._id.toString();
  if (!isOwner) {
    throw new ApiError(403, 'Only the creator can edit this expense');
  }

  const allowed = [
    'description',
    'amount',
    'paidBy',
    'category',
    'splitType',
    'splitDetails',
    'date',
  ];
  const body = req.body;
  const update = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'amount') update.amount = Number(body[key]);
      else if (key === 'date')
        update.date = body[key] ? new Date(body[key]) : expense.date;
      else update[key] = body[key];
    }
  }
  if (
    body.participantIds !== undefined &&
    expense.groupId &&
    (expense.splitType === 'equal' || update.splitType === 'equal')
  ) {
    const pids = Array.isArray(body.participantIds) ? body.participantIds : [];
    const amt = update.amount ?? expense.amount;
    if (pids.length > 0) {
      const share = parseFloat((amt / pids.length).toFixed(2));
      update.splitDetails = pids.map((uid) => ({ userId: uid, amount: share }));
    }
  }

  const updated = await Expense.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true }
  )
    .populate('paidBy', 'name email')
    .populate('splitDetails.userId', 'name');

  return res
    .status(200)
    .json(new ApiResponse(200, updated, 'Expense updated successfully'));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (RESERVED_IDS.includes(id) || !mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `Invalid expense ID: "${id}"`);
  }
  const expense = await Expense.findById(id);
  if (!expense) throw new ApiError(404, 'Expense not found');

  const isOwner =
    expense.createdBy &&
    expense.createdBy.toString() === req.user._id.toString();
  if (!isOwner) {
    throw new ApiError(403, 'Only the creator can delete this expense');
  }

  await Expense.findByIdAndDelete(id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

/**
 * Personal balances - uses splitDetails and paidBy (userId).
 */
const getBalances = asyncHandler(async (req, res) => {
  const userGroups = await Group.find({ members: req.user._id }).select('_id');
  const groupIds = userGroups.map((g) => g._id);

  const expenses = await Expense.find({
    $or: [{ createdBy: req.user._id }, { groupId: { $in: groupIds } }],
  }).select('amount paidBy splitDetails');

  const balanceMap = computeBalancesFromExpenses(expenses);

  const userIds = [...balanceMap.keys()];
  
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name')
    .lean();
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
    idKey: 'userId',
    nameKey: 'name',
    balanceKey: 'balance',
  });

  const result = settlements.map((s) => ({
    sender: s.fromName,
    receiver: s.toName,
    senderId: s.fromId,
    receiverId: s.toId,
    amount: s.amount,
    statement: s.statement,
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Settlements calculated successfully'));
});

const getBalancesByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  const isMember = group.members.some(
    (m) => m.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'You are not a member of this group');

  const expenses = await Expense.find({ groupId }).select(
    'amount paidBy splitDetails'
  );
  const balanceMap = computeBalancesFromExpenses(expenses);

  const userIds = [
    ...new Set([
      ...balanceMap.keys(),
      ...group.members.map((m) => m.toString()),
    ]),
  ];
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name')
    .lean();
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
    idKey: 'userId',
    nameKey: 'name',
    balanceKey: 'balance',
  });

  const result = settlements.map((s) => ({
    sender: s.fromName,
    receiver: s.toName,
    senderId: s.fromId,
    receiverId: s.toId,
    amount: s.amount,
    statement: s.statement,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, result, 'Group settlements calculated successfully')
    );
});

/**
 * Analytics for dashboard: total spending, by month, by category.
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const userGroups = await Group.find({ members: req.user._id }).select('_id');
  const groupIds = userGroups.map((g) => g._id);

  const expenses = await Expense.find({
    $or: [{ createdBy: req.user._id }, { groupId: { $in: groupIds } }],
  })
    .select('amount category date')
    .lean();

  const totalSpending = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const now = new Date();
  const byMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const total = expenses
      .filter((e) => {
        const expDate = e.date ? new Date(e.date) : null;
        return expDate && expDate >= monthStart && expDate <= monthEnd;
      })
      .reduce((s, e) => s + (e.amount || 0), 0);
    byMonth.push({
      month: d.toISOString().slice(0, 7),
      label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      total: parseFloat(total.toFixed(2)),
    });
  }

  const byCategory = {};
  expenses.forEach((e) => {
    const cat = e.category || 'Uncategorized';
    byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0);
  });
  const categoryBreakdown = Object.entries(byCategory).map(([name, total]) => ({
    name,
    total: parseFloat(total.toFixed(2)),
  }));

  const result = {
    totalSpending: parseFloat(totalSpending.toFixed(2)),
    expenseCount: expenses.length,
    byMonth,
    byCategory: categoryBreakdown,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Analytics fetched successfully'));
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
  getAnalytics,
};
