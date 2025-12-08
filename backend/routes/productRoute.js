// routes/productRoutes.js
import express from "express";
import {
  getProduct,
  getProductById,
  addPriceHistoryEntry,
} from "../controllers/productController.js";

const router = express.Router();

// GET all products (home screen)
router.get("/", getProduct);

// GET single product (detail page)
router.get("/:id", getProductById);

// POST add history entry (platform + price)
router.post("/:id/history", addPriceHistoryEntry);

export default router;
