const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  video: { type: String, required: true },
  featuredImg: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model("Video", schema);
