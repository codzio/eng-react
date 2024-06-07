const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  prodCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  prodSubCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductSubCategory",
    required: false,
  },
  prodFeatures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductFeatures",
      required: false,
    },
  ],
  description: { type: String, required: true },
  features: { type: String, required: false, allowNull: true },
  techSpec: { type: String, required: false, allowNull: true },
  pdf: { type: String, required: false, allowNull: true },
  featuredImg: { type: String, required: true },
  addImages: [
    {
      type: String,
      required: true,
    },
  ],
  disableLinking: { type: Boolean, required: true },
  videos: { type: [String], required: false, allowNull: true },
  homepage: { type: Boolean, required: true },
  metaTitle: { type: String, required: false, allowNull: true },
  metaDescription: { type: String, required: false, allowNull: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("Product", schema);
