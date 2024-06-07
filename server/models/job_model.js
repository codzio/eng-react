const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  department: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("Job", schema);
