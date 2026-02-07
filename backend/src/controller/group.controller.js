import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiRes.js';
import { Group } from '../model/group.model.js';
import { User } from '../model/user.model.js';
import { Expense } from '../model/expenses.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createGroup = asyncHandler(async (req, res) => {
  const { name, memberIds } = req.body;

  // 1. Basic validation
  if (!name) {
    throw new ApiError(400, 'Group name is required');
  }

  // 2. Ensure members is an array
  const members = Array.isArray(memberIds) ? memberIds : [];

  // 3. Add current user if not present
  if (!members.includes(req.user._id.toString())) {
    members.push(req.user._id);
  }

  // 4. Create group
  const group = await Group.create({
    name,
    members,
    createdBy: req.user._id,
  });

  // 5. Send response
  res
    .status(201)
    .json(new ApiResponse(201, group, 'Group created successfully'));
});

const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ members: req.user._id })
    .populate('members', 'name email')
    .populate('createdBy', 'name email')
    .sort({ updatedAt: -1 });
  return res
    .status(200)
    .json(new ApiResponse(200, groups, 'Groups fetched successfully'));
});

const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email');
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }
  const isMember = group.members.some(
    (m) => m._id.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ApiError(403, 'You are not a member of this group');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, group, 'Group details fetched successfully'));
});

const addMember = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, 'userId is required');
  }

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isMember = group.members.some(
    (m) => m.toString() === req.user._id.toString()
  );
  if (!isMember) {
    throw new ApiError(403, 'You must be a member to add others');
  }

  const userExists = await User.findById(userId).select('_id');
  if (!userExists) {
    throw new ApiError(404, 'User not found');
  }

  const uidStr = userId.toString();
  const alreadyInGroup = group.members.some((m) => m.toString() === uidStr);
  if (alreadyInGroup) {
    throw new ApiError(400, 'User is already in this group');
  }

  group.members.push(userId);
  await group.save();

  const populated = await Group.findById(group._id)
    .populate('members', 'name email')
    .populate('createdBy', 'name email');
  return res
    .status(200)
    .json(new ApiResponse(200, populated, 'Member added successfully'));
});

/** Delete group - only creator can delete. Group expenses are unlinked (groupId set to null). */
const deleteGroup = asyncHandler(async (req, res) => {
  const { id: groupId } = req.params;

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  const isCreator =
    group.createdBy &&
    group.createdBy.toString() === req.user._id.toString();
  if (!isCreator) {
    throw new ApiError(403, 'Only the group creator can delete this group');
  }

  // Unlink expenses from this group (preserve expense data as personal)
  await Expense.updateMany(
    { groupId },
    { $set: { groupId: null } }
  );

  await Group.findByIdAndDelete(groupId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Group deleted successfully'));
});

export { createGroup, getGroups, getGroupById, addMember, deleteGroup };
