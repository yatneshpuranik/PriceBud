// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import User from "../models/userModel.js";

// --------------------------------------
// PROTECT (logged-in users only)
// --------------------------------------
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.jwt;

  if (!token) {
    res.status(401);
    throw new Error("Not Authorized, No Token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // FIXED: MUST use decoded.userId (not userID)
    req.user = await User.findById(decoded.userId).select("-password");

    if (!req.user) {
      res.status(401);
return res.status(401).json({ message: "Not logged in" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(401);
    throw new Error("Not Authorized, Token Failed");
  }
});

// --------------------------------------
// ADMIN (admin only)
// --------------------------------------
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    return next();
  }

  res.status(401);
  throw new Error("Not authorized as Admin");
};

export { protect, admin };
