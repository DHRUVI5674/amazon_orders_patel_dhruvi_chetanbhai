import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  OrderID: {
    type: String,
    required: true,
    unique: true,
  },
  OrderDate: {
    type: Date,
    default: Date.now,
  },
  CustomerID: String,
  CustomerName: String,
  ProductID: String,
  ProductName: String,
  Category: String,
  Brand: String,
  Quantity: {
    type: Number,
    default: 1,
  },
  UnitPrice: {
    type: Number,
    default: 0,
  },
  Discount: {
    type: Number,
    default: 0,
  },
  Tax: {
    type: Number,
    default: 0,
  },
  ShippingCost: {
    type: Number,
    default: 0,
  },
  TotalAmount: {
    type: Number,
    default: 0,
  },
  PaymentMethod: String,
  OrderStatus: {
    type: String,
    default: "pending",
  },
  City: String,
  State: String,
  Country: String,
  SellerID: String,
});

// Indexes for better query performance

orderSchema.index({ CustomerID: 1, OrderDate: -1 });
orderSchema.index({ ProductID: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
