import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authenticateUser = asyncHandler(async (req, res, next) => {
  try {
    // Get token from cookies or headers
    // const token =
    //   req.cookies?.accessToken ||
    //   req.headers.authorization?.replace("Bearer ", "");
    // console.log("auth check  this is  your acces token --" ,token);
 
    const rawAuthHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken;
    const headerToken = rawAuthHeader && rawAuthHeader.startsWith("Bearer ")
    ? rawAuthHeader.split(" ")[1]
    : null;

  const token = cookieToken || headerToken;

  // console.log("AccessToken from cookie:", cookieToken);
  // console.log("Authorization header:", rawAuthHeader);
  // console.log("Final token to verify:", token);

    if (!token) {
      // Instead of throwing, return an error response directly
      return res.status(401).json(new ApiError(401, "Access denied. Token missing."));
    }
    // Verify token                          
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded?.id) {
      return res.status(401).json(new ApiError(401, "Invalid token payload."));
    }
    // Fetch user and exclude sensitive fields
    const user = await User.findById(decoded.id).select("-password -refreshToken");
    // console.log(user._id);
    if (!user) {
      return res.status(401).json(new ApiError(401, "User not found or unauthorized."));
    }
    // Attach user to request object
    req.user = user;
    // console.log("user auth",user);
    next();
  } catch (error) {
    console.error("Authentication Error:", error);
    // Handle JWT verification errors specifically
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json(new ApiError(401, "Invalid token."));
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json(new ApiError(401, "Token expired."));
    }
    // General error response
    return res.status(401).json(new ApiError(401, "Authentication failed."));
  }
});

export { authenticateUser };