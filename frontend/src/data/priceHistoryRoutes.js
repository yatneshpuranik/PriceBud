import express from "express";
import { getPriceHistory, addPriceHistory } from "../controllers/priceHistoryController.js";

const router = express.Router();

router.get("/:productId", getPriceHistory);
router.post("/", addPriceHistory);

export default router;
