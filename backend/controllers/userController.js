import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

// --------------------------------------
// Generate JWT Token
// --------------------------------------
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// --------------------------------------
// Login user
// --------------------------------------
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  generateToken(res, user._id);

  res.status(200).json({
    message: "Login successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

// --------------------------------------
// Register user
// --------------------------------------
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });

  generateToken(res, user._id);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

// --------------------------------------
// Logout user
// --------------------------------------
export const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// --------------------------------------
// Get Logged-in User Profile
// --------------------------------------
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("trackedItems")
    .populate("alerts.product");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    trackedItems: user.trackedItems || [],
    alerts: user.alerts || [],
  });
});

// --------------------------------------
// Update user profile (owner)
// --------------------------------------
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update allowed fields
  if (req.body.name) user.name = req.body.name;
  if (req.body.email) user.email = req.body.email;

  // Only set password if provided
  if (req.body.password && req.body.password.trim() !== "") {
    user.password = req.body.password;
  }

  const updated = await user.save();

  // Refresh token (optional but recommended)
  generateToken(res, updated._id);

  res.status(200).json({
    message: "Profile updated successfully",
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      isAdmin: updated.isAdmin,
    },
  });
});

// --------------------------------------
// Get all users (Admin)
// --------------------------------------
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(200).json(users);
});

// --------------------------------------
// Delete user (Admin)
// --------------------------------------
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.isAdmin) {
    res.status(400);
    throw new Error("Cannot delete admin account");
  }

  await User.deleteOne({ _id: user._id });

  res.status(200).json({ message: "User removed" });
});

// --------------------------------------
// Get user by ID (Admin)
// --------------------------------------
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json(user);
});

// --------------------------------------
// Update user (Admin)
// --------------------------------------
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Admin can update these fields
  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;

  if (req.body.password) {
    user.password = req.body.password;
  }

  // Only set isAdmin if it is provided
  if (typeof req.body.isAdmin !== "undefined") {
    user.isAdmin = Boolean(req.body.isAdmin);
  }

  const updated = await user.save();

  res.status(200).json({
    message: "User updated",
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      isAdmin: updated.isAdmin,
    },
  });
});
