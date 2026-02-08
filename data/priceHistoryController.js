import PriceHistory from "./priceHistoryModel.js";

// GET: /api/price-history/:productId
export const getPriceHistory = async (req, res) => {
  try {
    const history = await PriceHistory.find({ product: req.params.productId })
      .sort({ date: 1 }) // Oldest -> Newest
      .select("price date -_id"); // optional: send only price & date

    // If you want full document, remove .select(...)
    res.json(history);
  } catch (error) {
    console.error("getPriceHistory error:", error);
    res.status(500).json({ message: "Error fetching price history" });
  }
};

// POST: /api/price-history
export const addPriceHistory = async (req, res) => {
  try {
    const { product, price, date } = req.body;

    if (!product || price == null) {
      return res.status(400).json({ message: "product and price are required" });
    }

    const entry = await PriceHistory.create({
      product,
      price,
      date: date ? new Date(date) : Date.now(),
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("addPriceHistory error:", error);
    res.status(500).json({ message: "Error adding price history" });
  }
};
