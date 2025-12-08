import mongoose from "mongoose";

const trackedSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  viewedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Tracked", trackedSchema);
