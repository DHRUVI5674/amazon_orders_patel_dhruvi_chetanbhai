import Order from "../models/order.model.js";
import Payment from "../models/Payment.model.js";
import Product from "../models/Product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Shipment from "../models/shipment.model.js";

/**
 * =========================
 *  ORDER STATS
 * =========================
 */

// Total Orders
export const getTotalOrders = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Daily Orders
export const getDailyOrders = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $addFields: {
          orderDate: { $toDate: "$OrderDate" }, // ✅ FIX
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Monthly Orders
export const getMonthlyOrders = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $addFields: {
          orderDate: { $toDate: "$OrderDate" }, // ✅ FIX
        },
      },
      {
        $group: {
          _id: { $month: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Yearly Orders
export const getYearlyOrders = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $addFields: {
          orderDate: { $toDate: "$OrderDate" }, // ✅ convert string → Date
        },
      },
      {
        $group: {
          _id: { $year: "$orderDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // optional but recommended
      {
        $project: {
          _id: 0,
          year: "$_id",
          count: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * =========================
 *  REVENUE STATS (Payment)
 * =========================
 */

// Total Revenue
export const getTotalRevenueStats = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $match: {
          PaymentStatus: { $regex: "^paid$", $options: "i" }, // exact match
        },
      },
      {
        $addFields: {
          totalAmount: { $toDouble: "$TotalAmount" }, // simpler
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      totalRevenue: data[0]?.totalRevenue || 0,
      totalTransactions: data[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Daily Revenue
export const getDailyRevenue = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $match: {
          PaymentStatus: { $regex: "^paid$", $options: "i" },
        },
      },
      {
        $addFields: {
          amount: { $toDouble: "$TotalAmount" },
          date: {
            $dateFromString: {
              dateString: "$OrderDate",
              onError: null,
            },
          },
        },
      },
      {
        $match: { date: { $ne: null } },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              { $toString: "$_id.month" },
              "-",
              { $toString: "$_id.day" },
            ],
          },
          total: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Monthly Revenue
export const getMonthlyRevenueStats = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $match: {
          PaymentStatus: { $regex: "^paid$", $options: "i" },
        },
      },
      {
        $addFields: {
          amount: { $toDouble: "$TotalAmount" },
          date: {
            $ifNull: [
              { $toDate: "$createdAt" },
              { $dateFromString: { dateString: "$OrderDate", onError: null } }
            ]
          }
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          total: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Yearly Revenue
export const getYearlyRevenueStats = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $match: {
          PaymentStatus: { $regex: "^paid$", $options: "i" },
        },
      },
      {
        $addFields: {
          amount: { $toDouble: "$TotalAmount" },
          date: {
            $ifNull: [
              { $toDate: "$createdAt" },
              { $dateFromString: { dateString: "$OrderDate", onError: null } }
            ]
          }
        },
      },
      {
        $group: {
          _id: { year: { $year: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          total: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * =========================
 *  COUNTS
 * =========================
 */

export const getProductCount = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoryCount = async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * =========================
 *  REFUNDS & CANCELS
 * =========================
 */

export const getRefundCount = async (req, res) => {
  try {
    const count = await Payment.countDocuments({
      PaymentStatus: { $regex: "^refunded$", $options: "i" }
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCancellationCount = async (req, res) => {
  try {
    const count = await Order.countDocuments({
      OrderStatus: { $regex: "cancel", $options: "i" }
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAverageShippingTime = async (req, res) => {
  try {
    const data = await Shipment.aggregate([
      {
        $addFields: {
          shippedDate: {
            $dateFromString: {
              dateString: "$shippedAt",
              onError: null,
              onNull: null
            }
          },
          deliveredDate: {
            $dateFromString: {
              dateString: "$deliveredAt",
              onError: null,
              onNull: null
            }
          }
        }
      },
      {
        $match: {
          shippedDate: { $ne: null },
          deliveredDate: { $ne: null }
        }
      },
      {
        $project: {
          durationDays: {
            $divide: [
              { $subtract: ["$deliveredDate", "$shippedDate"] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$durationDays" }
        }
      }
    ]);

    res.json({
      success: true,
      avgShippingDays: data[0]?.avgTime || 0
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/**
 * =========================
 *  SYSTEM PERFORMANCE
 * =========================
 */

export const getSystemPerformance = async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();

    const memory = process.memoryUsage();

    const performance = {
      uptime: {
        seconds: uptimeSeconds,
        minutes: (uptimeSeconds / 60).toFixed(2),
        hours: (uptimeSeconds / 3600).toFixed(2),
      },

      memory: {
        rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`,
      },

      cpuUsage: process.cpuUsage(),

      nodeVersion: process.version,

      platform: process.platform,

      timestamp: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      performance,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};