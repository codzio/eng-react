const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path")

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true },
  subject: { type: String, required: false, allowNull: true },
  message: { type: String, required: false, allowNull: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('Contact', schema);