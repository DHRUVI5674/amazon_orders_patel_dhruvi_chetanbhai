import User from "../models/User.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/Payment.model.js";
import fs from "fs";
import path from "path";

/* =========================
   USERS
========================= */

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "User banned successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBanned: false },
      { new: true }
    );

    res.json({
      success: true,
      message: "User unbanned successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json({
      success: true,
      message: "User role updated",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   ORDERS
========================= */

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ OrderDate: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   REPORTS
========================= */

export const getSalesReport = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$OrderStatus",
          totalOrders: { $sum: 1 },
          totalSales: { $sum: { $toDouble: "$TotalAmount" } },
        },
      },
      { $sort: { totalSales: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRevenueReport = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      { $match: { status: { $regex: "^success$", $options: "i" } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $toDouble: "$amount" } },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: data[0] || { totalRevenue: 0, totalTransactions: 0 },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* =========================
   SYSTEM
========================= */

export const systemHealth = async (req, res) => {
  try {
    const [users, orders, payments] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Payment.countDocuments(),
    ]);

    res.json({
      success: true,
      status: "OK",
      data: {
        users,
        orders,
        payments,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------- CACHE (MOCK) -------- */

export const clearCache = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Cache cleared successfully (mock)",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------- LOGS -------- */

export const getSystemLogs = async (req, res) => {
  try {
    const logPath = path.resolve("logs/app.log");

    if (!fs.existsSync(logPath)) {
      return res.json({ success: true, data: [] });
    }

    const logs = fs.readFileSync(logPath, "utf-8").split("\n").slice(-100);

    res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------- MAINTENANCE MODE -------- */

let maintenanceMode = false;

export const toggleMaintenance = async (req, res) => {
  try {
    maintenanceMode = !maintenanceMode;

    res.json({
      success: true,
      maintenanceMode,
      message: maintenanceMode
        ? "Maintenance enabled"
        : "Maintenance disabled",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* -------- BACKUPS (MOCK) -------- */

export const getBackups = async (req, res) => {
  try {
    const backups = [
      { id: "bkp1", name: "backup-01", createdAt: "2024-01-01" },
      { id: "bkp2", name: "backup-02", createdAt: "2024-02-01" },
    ];

    res.json({
      success: true,
      count: backups.length,
      data: backups,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTopCustomers = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: "$CustomerName", totalOrders: { $sum: 1 }, totalSpent: { $sum: { $toDouble: "$TotalAmount" } } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTopProducts = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: "$ProductName", totalSold: { $sum: "$Quantity" }, totalRevenue: { $sum: { $toDouble: "$TotalAmount" } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};