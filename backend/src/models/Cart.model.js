// models/cart.model.js

import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        productName: String,
        price: Number,

        quantity: {
          type: Number,
          required: true,
          default: 1
        },

        total: Number
      }
    ],

    totalItems: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 });
cartSchema.index({ 'items.product': 1 });
export default Cart;