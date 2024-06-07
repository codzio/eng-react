const mongoose = require('mongoose');

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: false, allowNull: true  },
  products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Reference to the Service Type model
      required: true,
  }],
  homepage: { type: Boolean, required: true },
  metaTitle: { type: String, required: false, allowNull: true },
  metaDescription: { type: String, required: false, allowNull: true  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('Project', schema);