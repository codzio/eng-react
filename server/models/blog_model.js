const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path")

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: true,
  },
  shortDescription: { type: String, required: false, allowNull: true  },
  description: { type: String, required: true },
  image: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users', // Reference to the Users model
    required: true,
  },
  credit: { type: String, required: false, allowNull: true },
  publishDate: { type: Date, required: true, default: Date.now },
  metaTitle: { type: String, required: false, allowNull: true },
  metaDescription: { type: String, required: false, allowNull: true  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

schema.index({ publishDate: -1 }); // -1 for descending order

// Create a user model
module.exports = mongoose.model('Blog', schema);