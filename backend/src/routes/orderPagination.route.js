import express from "express";
import {
   getOrdersPaginated,
   getPagedOrders,
   getInfiniteOrders,
   getRecentOrders,
   getCancelledOrders,
   getRefundedOrders,
   getCustomerOrders,
   getProductOrders,
   getSearchPaginatedOrders,
} from "../controllers/orderPagination.controller.js";

const router = express.Router();

/* =========================
   1. STATIC ROUTES (NO PARAMS)
   MUST COME FIRST
========================= */

router.get("/", getOrdersPaginated);

router.get("/paged", getPagedOrders);
router.get("/infinite", getInfiniteOrders);

router.get("/recent", getRecentOrders);
router.get("/cancelled", getCancelledOrders);
router.get("/refunded", getRefundedOrders);

router.get("/search", getSearchPaginatedOrders);

/* =========================
   2. DYNAMIC ROUTES (PARAMS)
   MUST COME LAST
========================= */

router.get("/customer/:customerId", getCustomerOrders);
router.get("/product/:productId", getProductOrders);

export default router;