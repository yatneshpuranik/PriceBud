import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAlerts,
  getUnreadAlertCount,
} from "../controllers/alertController.js";

const router = express.Router();

// Auto alerts (no manual create)
router.get("/", protect, getAlerts);
router.get("/unread-count", protect, getUnreadAlertCount);

export default router;
