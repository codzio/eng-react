const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  profile: { type: String, required: true },
  jobTitle: { type: String, required: false, allowNull: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  message: { type: String, required: false, allowNull: true },
  resume: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("Career", schema);
