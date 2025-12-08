import mongoose from "mongoose";

// Corrected price history schema
const historySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, required: true }, // date STRING will auto-convert
});

// Platform schema
const platformSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String },
  currentPrice: { type: Number, required: true },
  history: [historySchema], // Correct history parsing
});

// Product schema
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    brand: { type: String },
    category: { type: String },
    platforms: { type: [platformSchema], default: [] }, // prevents splitting
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
