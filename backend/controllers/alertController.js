import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// -----------------------------------------------------
// @desc    Add Alert for a product
// @route   POST /api/alerts
// @access  Private
// -----------------------------------------------------
export const addAlert = asyncHandler(async (req, res) => {
  const { productId, targetPrice } = req.body;

  if (!productId || !targetPrice) {
    return res.status(400).json({ message: "Product ID & target price required" });
  }

  const user = await User.findById(req.user._id);

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  // Check duplicate alert
  const exists = user.alerts.find(
    (a) => a.product.toString() === productId.toString()
  );

  if (exists)
    return res.status(400).json({ message: "Alert already exists for this product" });

  user.alerts.push({
    product: productId,
    targetPrice,
  });

  await user.save();

  res.status(201).json({ message: "Alert added successfully", alerts: user.alerts });
});

// -----------------------------------------------------
// @desc    Get all alerts of logged-in user
// @route   GET /api/alerts
// @access  Private
// -----------------------------------------------------
export const getAlerts = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("alerts.product");

  res.json(user.alerts);
});

// -----------------------------------------------------
// @desc    Delete a specific alert
// @route   DELETE /api/alerts/:alertId
// @access  Private
// -----------------------------------------------------
export const deleteAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;

  const user = await User.findById(req.user._id);

  user.alerts = user.alerts.filter(
    (alert) => alert._id.toString() !== alertId
  );

  await user.save();

  res.json({ message: "Alert removed", alerts: user.alerts });
});
