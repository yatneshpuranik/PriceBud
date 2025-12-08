import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/productModel.js";

// ---------------------------------------------------
// GET ALL PRODUCTS (Home Screen)
// GET ALL PRODUCTS (with search)
// ---------------------------------------------------
// GET ALL PRODUCTS (Home Screen + Search)
// ---------------------------------------------------
export const getProduct = asyncHandler(async (req, res) => {
  const searchQuery = req.query.search || "";

  const keyword = searchQuery
    ? { title: { $regex: searchQuery, $options: "i" } }
    : {};

  const products = await Product.find(keyword);

  res.json(products);  
});






// ---------------------------------------------------
// GET SINGLE PRODUCT WITH PLATFORM-WISE HISTORY
// ---------------------------------------------------
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Send platforms exactly as stored
  res.json({
    _id: product._id,
    title: product.title,
    image: product.image,
    description: product.description,
    platforms: product.platforms,       // <-- IMPORTANT
    lastUpdated: product.lastUpdated,
  });
});

// ---------------------------------------------------
// ADD PRICE HISTORY ENTRY
// ---------------------------------------------------
export const addPriceHistoryEntry = asyncHandler(async (req, res) => {
  const { platformName, price } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) throw new Error("Product not found");

  const platform = product.platforms.find(
    (p) => p.name.toLowerCase() === platformName.toLowerCase()
  );

  if (!platform) throw new Error("Platform not found");

  platform.currentPrice = price;

  // REAL FIX – add both price + date
  platform.history.push({
    price: price,
    date: new Date()
  });

  product.lastUpdated = Date.now();
  await product.save();

  res.json({ message: "Price updated", product });
});
