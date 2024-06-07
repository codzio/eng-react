const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  description: { type: String, required: false, allowNull: true },
  title: { type: String, required: true },
  pdf: { type: String, required: false, allowNull: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("ProductVariants", schema);
