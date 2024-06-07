const mongoose = require('mongoose');
const fs = require("fs");
const path = require("path")

const { Schema } = mongoose;

// Define the user schema
const schema = new Schema({
  websiteName: { type: String, required: true },
  websiteEmail: { type: String, required: true },
  websitePhone: { type: Number, required: false, allowNull: true },
  websiteAddress: { type: String, required: false, allowNull: true  },
  copyright: { type: String, required: true },
  adminLogo: { type: String, required: true },
  websiteLogo: { type: String, required: true },
  loginPageImg: { type: String, required: true },
  favicon: { type: String, required: true },
  footerDescription: { type: String, required: false, allowNull: true  },
  scripts: {
    header: { type: String, required: false, allowNull: true  },
    footer: { type: String, required: false, allowNull: true  },
  },
  socialLinks: {
    facebook: { type: String, required: false, allowNull: true  },
    twitter: { type: String, required: false, allowNull: true  },
    instagram: { type: String, required: false, allowNull: true  },
    youtube: { type: String, required: false, allowNull: true  },
    linkedin: { type: String, required: false, allowNull: true  },
  },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
});

// Create a user model
module.exports = mongoose.model('SiteSetting', schema);