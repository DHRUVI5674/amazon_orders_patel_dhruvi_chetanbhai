// controllers/advanced.controller.js

import Product from "../models/Product.model.js";
import Order from "../models/order.model.js";
import Payment from "../models/Payment.model.js";
import User from "../models/User.model.js";
import Notification from "../models/Notification.model.js";


// =========================
// RECOMMEND PRODUCTS
// =========================
export const getRecommendedProducts = async (req, res) => {
  try {
    const { customerId } = req.params;

    const orders = await Order.find({
      CustomerID: customerId
    });

    const categories = orders.map(order => order.Category);

    const filters = categories.filter(Boolean).map(category => ({ Category: category }));

    let products = [];
    let criteria = filters.length ? filters : [{ info: "No categories found for customer orders" }];

    if (filters.length) {
      products = await Product.find({ $or: filters }).limit(5);
    }

    if (!products.length) {
      products = await Product.find().limit(5);
      criteria = [{ info: "Returned popular products as fallback" }];
    }

    res.json({
      success: true,
      customerId,
      recommendationCriteria: criteria,
      recommendations: products
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// RECOMMEND PRODUCTS FROM ORDER
// =========================
export const getRecommendedProductsFromOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      OrderID: orderId
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const filters = [];
    if (order.Category) filters.push({ Category: order.Category });
    if (order.Brand) filters.push({ Brand: order.Brand });
    if (order.ProductID) filters.push({ ProductID: { $ne: order.ProductID } });

    let products = [];
    let criteria = filters.length ? filters : [{ info: "No order category or brand available" }];

    if (filters.length) {
      products = await Product.find({
        $and: [
          { ProductID: { $ne: order.ProductID } },
          { $or: filters }
        ]
      }).limit(5);
    }

    if (!products.length) {
      products = await Product.find({
        ProductID: { $ne: order.ProductID }
      }).limit(5);
      criteria = [{ info: "Returned popular products as fallback" }];
    }

    res.json({
      success: true,
      order: {
        OrderID: order.OrderID,
        Category: order.Category,
        Brand: order.Brand,
        ProductID: order.ProductID,
        ProductName: order.ProductName
      },
      recommendationCriteria: criteria,
      recommendations: products
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// TRENDING PRODUCTS
// =========================
export const getTrendingProducts = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$ProductName",
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// TRENDING CATEGORIES
// =========================
export const getTrendingCategories = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$Category",
          totalOrders: { $sum: 1 }
        }
      },
      {
        $sort: { totalOrders: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// GET NOTIFICATIONS
// =========================
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.find().sort({
      createdAt: -1
    });

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// MARK NOTIFICATION AS READ
// =========================
export const markNotificationRead = async (req, res) => {
  try {
    const data = await Notification.findByIdAndUpdate(
      req.params.id,
      {
        isRead: true
      },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification marked as read",
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// DELETE NOTIFICATION
// =========================
export const deleteNotification = async (req, res) => {
  try {
    const data = await Notification.findByIdAndDelete(
      req.params.id
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }

    res.json({
      success: true,
      message: "Notification deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// ACTIVITY LOGS
// =========================
export const getActivityLogs = async (req, res) => {
  try {
    const logs = [
      {
        action: "Order Created",
        module: "Orders",
        time: new Date()
      },
      {
        action: "Payment Success",
        module: "Payments",
        time: new Date()
      }
    ];

    res.json({
      success: true,
      data: logs
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// DASHBOARD OVERVIEW
// =========================
export const getDashboardOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const totalUsers = await User.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalRevenue = await Payment.aggregate([
      {
        $group: {
          _id: null,
          revenue: {
            $sum: {
              $toDouble: "$TotalAmount"
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue:
        totalRevenue[0]?.revenue || 0
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// REVENUE DASHBOARD
// =========================
export const getRevenueDashboard = async (req, res) => {
  try {
    const data = await Payment.aggregate([
      {
        $group: {
          _id: "$PaymentMethod",
          revenue: {
            $sum: {
              $toDouble: "$TotalAmount"
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// ORDERS DASHBOARD
// =========================
export const getOrdersDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const deliveredOrders = await Order.countDocuments({
      OrderStatus: "Delivered"
    });

    const cancelledOrders = await Order.countDocuments({
      OrderStatus: "Cancelled"
    });

    res.json({
      success: true,
      totalOrders,
      deliveredOrders,
      cancelledOrders
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// CUSTOMERS DASHBOARD
// =========================
export const getCustomersDashboard = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments();

    res.json({
      success: true,
      totalCustomers
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// PRODUCTS DASHBOARD
// =========================
export const getProductsDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();

    const categories = await Product.distinct("Category");

    res.json({
      success: true,
      totalProducts,
      totalCategories: categories.length
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// SYSTEM VERSION
// =========================
export const getSystemVersion = async (req, res) => {
  try {
    res.json({
      success: true,
      version: "1.0.0"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// SYSTEM CONFIG
// =========================
export const getSystemConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      config: {
        appName: "ShopFusion",
        environment: process.env.NODE_ENV || "development"
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// SYSTEM UPTIME
// =========================
export const getSystemUptime = async (req, res) => {
  try {
    res.json({
      success: true,
      uptime: process.uptime()
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// PING SERVER
// =========================
export const pingServer = async (req, res) => {
  try {
    res.json({
      success: true,
      message: "Server is running"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// DATABASE STATUS
// =========================
export const getDatabaseStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      database: "Connected"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      database: "Disconnected",
      message: err.message
    });
  }
};


// =========================
// CACHE STATUS
// =========================
export const getCacheStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      cache: "Active"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// STORAGE STATUS
// =========================
export const getStorageStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      storage: "Available"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};