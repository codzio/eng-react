const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  heading1: { type: String, required: false, allowNull: true },
  heading2: { type: String, required: false, allowNull: true },
  description: { type: String, required: false, allowNull: true },
  data: { type: mongoose.Schema.Types.Mixed, required: false, allowNull: true},
  metaTitle: { type: String, required: false, allowNull: true },
  metaDescription: { type: String, required: false, allowNull: true  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('Page', schema);