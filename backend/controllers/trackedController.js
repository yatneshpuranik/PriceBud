import Tracked from "../models/trackedModel.js";

// GET TRACKED ITEMS (sorted by latest viewed)
export const getTracked = async (req, res) => {
  const items = await Tracked.find({ user: req.user._id })
    .populate("product")
    .sort({ viewedAt: -1 });

  res.json(
    items.map((i) => ({
      ...i.product._doc,
      viewedAt: i.viewedAt,
      trackId: i._id,   // needed to delete
    }))
  );
};

// ADD or UPDATE TRACKED
export const addTracked = async (req, res) => {
  const { productId } = req.body;

  let exists = await Tracked.findOne({
    user: req.user._id,
    product: productId,
  });

  if (exists) {
    exists.viewedAt = Date.now();
    await exists.save();
    return res.json({ message: "Updated timestamp" });
  }

  await Tracked.create({
    user: req.user._id,
    product: productId,
    viewedAt: Date.now(),
  });

  res.json({ message: "Added to tracked" });
};

// DELETE ONE
export const removeTracked = async (req, res) => {
  await Tracked.deleteOne({ _id: req.params.id, user: req.user._id });
  res.json({ message: "Removed" });
};

// CLEAR ALL
export const clearTracked = async (req, res) => {
  await Tracked.deleteMany({ user: req.user._id });
  res.json({ message: "Cleared all" });
};
