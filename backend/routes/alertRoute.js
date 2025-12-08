import express from "express";
import { addAlert, getAlerts, deleteAlert } from "../controllers/alertController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, addAlert)   // Add alert
  .get(protect, getAlerts);  // Get all alerts

router.route("/:alertId")
  .delete(protect, deleteAlert); // Delete alert

export default router;
