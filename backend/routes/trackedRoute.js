import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addTracked,
  getTracked,
  removeTracked,
  clearTracked,
} from "../controllers/trackedController.js";

const router = express.Router();

router.get("/", protect, getTracked);
router.post("/", protect, addTracked);
router.delete("/:id", protect, removeTracked);
router.delete("/", protect, clearTracked);

export default router;
