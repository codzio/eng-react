const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("Why", schema);
