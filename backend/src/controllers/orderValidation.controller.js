// controllers/validation.controller.js

import Order from "../models/order.model.js";
import Payment from "../models/Payment.model.js";
import Product from "../models/Product.model.js";
import User from "../models/user.model.js";


// =========================
// VALIDATE ORDER
// =========================
export const validateOrder = async (req, res) => {
  try {
    const {
      OrderID,
      CustomerID,
      ProductID,
      Quantity,
      TotalAmount
    } = req.body;

    // required fields
    if (
      !OrderID ||
      !CustomerID ||
      !ProductID ||
      !Quantity ||
      !TotalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required order fields"
      });
    }

    // duplicate order check
    const existingOrder = await Order.findOne({ OrderID });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: "Order already exists"
      });
    }

    // quantity validation
    if (Quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    // amount validation
    if (TotalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "TotalAmount must be greater than 0"
      });
    }

    res.json({
      success: true,
      message: "Order validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// VALIDATE ORDER UPDATE
// =========================
export const validateOrderUpdate = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: "Order exists and update is allowed",
      data: {
        order,
        updatePayload: req.body
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
// VALIDATE COUPON
// =========================
export const validateCoupon = async (req, res) => {
  try {
    const { CouponCode, TotalAmount } = req.body;

    if (!CouponCode || !TotalAmount) {
      return res.status(400).json({
        success: false,
        message: "CouponCode and TotalAmount are required"
      });
    }

    const code = CouponCode.trim().toUpperCase();
    const validCoupons = {
      SAVE10: 0.10,
      SAVE20: 0.20,
      WELCOME5: 0.05,
      FREESHIP: 0
    };

    if (!validCoupons.hasOwnProperty(code)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon code"
      });
    }

    const discountRate = validCoupons[code];
    const discountAmount = Number(TotalAmount) * discountRate;
    const finalAmount = Number(TotalAmount) - discountAmount;

    res.json({
      success: true,
      message: "Coupon validation successful",
      data: {
        CouponCode: code,
        discountRate,
        discountAmount,
        originalAmount: Number(TotalAmount),
        finalAmount
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
// VALIDATE UPLOAD
// =========================
export const validateUpload = async (req, res) => {
  try {
    const fileName = req.body.fileName || req.body.filename || req.body.name;
    const fileSize = Number(req.body.fileSize || req.body.size || 0);
    const fileType = req.body.fileType || req.body.type || "unknown";

    if (!fileName) {
      return res.status(400).json({
        success: false,
        message: "File name is required"
      });
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
    const lowerName = fileName.toLowerCase();
    const extension = allowedExtensions.find((ext) => lowerName.endsWith(ext));

    if (!extension) {
      return res.status(400).json({
        success: false,
        message: "Unsupported file type"
      });
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (fileSize > maxSizeBytes) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit"
      });
    }

    res.json({
      success: true,
      message: "File upload validation successful",
      data: {
        fileName,
        fileSize,
        fileType,
        extension,
        valid: true
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
// VALIDATE PAYMENT
// =========================
export const validatePayment = async (req, res) => {
  try {

    const {
      OrderID,
      PaymentMethod,
      TotalAmount
    } = req.body;

    if (!OrderID || !PaymentMethod || !TotalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing payment fields"
      });
    }

    // check order exists
    const order = await Order.findOne({ OrderID });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // valid payment methods
    const validMethods = [
      "UPI",
      "Credit Card",
      "Debit Card",
      "PayPal",
      "Cash On Delivery"
    ];

    if (!validMethods.includes(PaymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method"
      });
    }

    // check duplicate payment
    const existingPayment = await Payment.findOne({ OrderID });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this order"
      });
    }

    res.json({
      success: true,
      message: "Payment validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// VALIDATE REGISTER
// =========================
export const validateRegister = async (req, res) => {
  try {

    const {
      name,
      email,
      password
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // email format
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // existing user check
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    res.json({
      success: true,
      message: "Registration validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// VALIDATE LOGIN
// =========================
export const validateLogin = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    // user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // password check
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    res.json({
      success: true,
      message: "Login validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// VALIDATE PRODUCT
// =========================
export const validateProduct = async (req, res) => {
  try {

    const {
      ProductID,
      ProductName,
      UnitPrice,
      Quantity
    } = req.body;

    if (
      !ProductID ||
      !ProductName ||
      !UnitPrice
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing product fields"
      });
    }

    // duplicate product
    const existingProduct = await Product.findOne({
      ProductID
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "Product already exists"
      });
    }

    // price validation
    if (UnitPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "UnitPrice must be greater than 0"
      });
    }

    // quantity validation
    if (Quantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity cannot be negative"
      });
    }

    res.json({
      success: true,
      message: "Product validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// =========================
// VALIDATE REFUND
// =========================
export const validateRefund = async (req, res) => {
  try {

    const { OrderID } = req.body;

    if (!OrderID) {
      return res.status(400).json({
        success: false,
        message: "OrderID is required"
      });
    }

    // order exists
    const order = await Order.findOne({ OrderID });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // refund allowed only for delivered orders
    if (order.OrderStatus !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Refund allowed only for delivered orders"
      });
    }

    res.json({
      success: true,
      message: "Refund validation successful"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};