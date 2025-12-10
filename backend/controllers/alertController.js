import asyncHandler from "../middleware/asyncHandler.js";
import Tracked from "../models/trackedModel.js";
import Product from "../models/productModel.js";
import Alert from "../models/alertModel.js";

const DROP_THRESHOLD = 0.2; // 20%

// Helper: compute best price + max historical price
function computeDropData(product) {
  if (!product.platforms || product.platforms.length === 0) return null;

  let currentBest = Infinity;
  let maxHistorical = 0;

  product.platforms.forEach((p) => {
    if (typeof p.currentPrice === "number") {
      currentBest = Math.min(currentBest, p.currentPrice);
    }

    (p.history || []).forEach((h) => {
      if (typeof h.price === "number") {
        if (h.price > maxHistorical) maxHistorical = h.price;
      }
    });
  });

  if (!isFinite(currentBest) || maxHistorical <= 0) return null;

  const dropPercent = ((maxHistorical - currentBest) / maxHistorical) * 100;

  return {
    currentBest,
    maxHistorical,
    dropPercent,
  };
}

// 🔁 Auto-refresh alerts for this user based on tracked products
async function refreshAlertsForUser(userId) {
  const trackedItems = await Tracked.find({ user: userId }).populate("product");

  for (const t of trackedItems) {
    const product = t.product;
    if (!product) continue;

    const info = computeDropData(product);
    if (!info) continue;

    const { currentBest, maxHistorical, dropPercent } = info;

    if (dropPercent >= DROP_THRESHOLD * 100) {
      const message = `Price dropped ${dropPercent.toFixed(
        1
      )}% from ${maxHistorical.toFixed(0)} to ${currentBest.toFixed(0)}.`;

      await Alert.findOneAndUpdate(
        { user: userId, product: product._id },
        {
          user: userId,
          product: product._id,
          dropPercent,
          currentPrice: currentBest,
          previousHigh: maxHistorical,
          message,
          seen: false, // new drop -> mark unread
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // Optional: if price recovered, you can delete old alert
      // await Alert.deleteOne({ user: userId, product: product._id });
    }
  }
}

// GET /api/alerts  → list alerts + mark as seen
export const getAlerts = asyncHandler(async (req, res) => {
  await refreshAlertsForUser(req.user._id);

  const alerts = await Alert.find({ user: req.user._id })
    .populate("product")
    .sort({ createdAt: -1 });

  // User ne alerts screen open ki → mark all seen
  await Alert.updateMany(
    { user: req.user._id, seen: false },
    { $set: { seen: true } }
  );

  res.json(alerts);
});

// GET /api/alerts/unread-count → sirf count for bell icon
export const getUnreadAlertCount = asyncHandler(async (req, res) => {
  await refreshAlertsForUser(req.user._id);

  const count = await Alert.countDocuments({
    user: req.user._id,
    seen: false,
  });

  res.json({ count });
});
