import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { User } from "../model/user.model.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  console.log("registerUser", req.body);
  
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const user = await User.create({ name, email, password });
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userWithoutSensitive = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        201,
        { user: userWithoutSensitive, accessToken, refreshToken },
        "User registered successfully"
      )
    );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.checkPassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const userWithoutSensitive = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: userWithoutSensitive, accessToken, refreshToken },
        "Login successful"
      )
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user) {
    user.refreshToken = "";
    await user.save({ validateBeforeSave: false });
  }

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, "Profile retrieved"));
});



export const getAllUsers = asyncHandler(async (req, res) => {
  
  const currentUser = req.user;
  const users = await User.find(
    {
      _id: { $ne: currentUser._id }
    }
  ).select("-password -refreshToken");

  if (!users) {
    throw new ApiError(404, "Users not found");
  }

  return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

// Public: no auth. Generates deterministic avatar from user id so <img src="..."> works.
export const getUserAvatar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "User id is required");
  }
  const avatar = createAvatar(lorelei, {
    seed: id,
    size: 128,
    randomizeIds: true,
  });
  const svg = avatar.toString();
  res.set("Content-Type", "image/svg+xml").send(svg);
});