const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path")

const { Schema } = mongoose;

// Define the user schema
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: Number, required: false, allowNull: true },
  address: { type: String, required: false, allowNull: true  },
  password: { type: String, required: true },
  isActive: { type: Boolean, required: true },  
  profileImg: { type: String, required: false },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('Users', userSchema);