const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  name: { type: String, required: true },
  designation: { type: String, required: false, allowNull: true  },
  review: { type: String, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('Testimonial', schema);