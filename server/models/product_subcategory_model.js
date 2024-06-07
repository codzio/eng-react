const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  prodCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductCategory",
    required: true,
  },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("ProductSubCategory", schema);
