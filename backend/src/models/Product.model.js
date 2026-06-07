// models/product.model.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    ProductID: {
      type: String,
      required: true,
      unique: true,
    },

    ProductName: {
      type: String,
      required: true,
    },

    Category: {
      type: String,
      required: true,
    },

    Brand: String,

    UnitPrice: {
      type: Number,
      required: true,
    },

    Quantity: {
      type: Number,
      default: 0  
    },

    SellerID: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Indexes for frequent queries
productSchema.index({ ProductID: 1 });
productSchema.index({ Category: 1 });
productSchema.index({ Brand: 1 });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;