import express from "express";
import searchRouter from "./orderSearch.route.js";
import filterRouter from "./orderFilter.route.js";
import paginationRouter from "./orderPagination.route.js";
import sortRouter from "./orderSort.route.js";
import analyticsRouter from "./analytics.route.js";
import orderStatsRoutes from "./orderStats.route.js";
import shipmentRouter from "./orderShipment.route.js";
import bulkOrderRouter from "./orderBulk.route.js";
import authMiddleware from "../middleware/Auth.middleware.js";
import authRoutes from "./orderAuth.route.js";
import adminRoutes from "./orderAdmin.route.js";
import errorRoutes from "./orderError.route.js";
import validationRoutes from "./orderValidation.route.js";
import advancedRoutes from "./orderAdvance.route.js";
import {
  getAllOrders,
  getOrderById,
  createOrder,
  replaceOrder,
  updateOrder,
  deleteOrder,
  checkOrderExists,
  getOrderSummary,
  getOrderItems,
  getOrderHistory,
  archiveOrder,
  restoreOrder,
  cancelOrder,
  duplicateOrder,
  getInvoice
} from "../controllers/order.controller.js";

const router = express.Router();

/**
 * ======================
 * ✅ FEATURE ROUTES FIRST
 * ======================
 */
router.use("/search", searchRouter);
router.use("/filter", filterRouter);
router.use("/", sortRouter);
router.use("/", paginationRouter);
router.use("/analytics", analyticsRouter);
router.use("/stats", orderStatsRoutes);
router.use("/", shipmentRouter);
router.use("/bulk", bulkOrderRouter);
router.use("/", authRoutes);
router.use("/", adminRoutes);
router.use("/", errorRoutes);
router.use("/", validationRoutes);
router.use("/", advancedRoutes);
/**
 * ======================
 * CRUD (NON-CONFLICT SAFE)
 * ======================
 */
router.post("/", createOrder);
router.get("/", getAllOrders);

/**
 * ======================
 * PARAM ROUTES LAST (IMPORTANT FIX)
 * ======================
 */
router.get("/:orderId", getOrderById);
router.put("/:orderId", replaceOrder);
router.patch("/:orderId", updateOrder);
router.delete("/:orderId", deleteOrder);

/**
 * ======================
 * EXTRA ORDER ACTION ROUTES
 * ======================
 */
router.get("/:orderId/exists", checkOrderExists);
router.get("/:orderId/summary", getOrderSummary);
router.get("/:orderId/items", getOrderItems);
router.get("/:orderId/history", getOrderHistory);

router.patch("/:orderId/archive", archiveOrder);
router.patch("/:orderId/restore", restoreOrder);

router.post("/:orderId/cancel", cancelOrder);
router.post("/:orderId/duplicate", duplicateOrder);

router.get("/:orderId/invoice", getInvoice);

export default router;