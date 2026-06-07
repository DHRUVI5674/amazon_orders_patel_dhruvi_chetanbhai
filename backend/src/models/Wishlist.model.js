// models/wishlist.model.js

import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    CustomerID: {
      type: String,
      required: true
    },

    Products: [
      {
        ProductID: {
          type: String,
          required: true
        }
      }
    ]
wishlistSchema.index({ CustomerID: 1 });
wishlistSchema.index({ 'Products.ProductID': 1 });

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;