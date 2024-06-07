const path = require("path")
const express = require("express");
const router = express.Router();
const apiBlogController = require("../../controllers/api/blogs");

router.get("/blogs/category", apiBlogController.getBlogsByCategory);
router.get("/blogs/:slug", apiBlogController.getBlogDetail);
router.get("/blogs/", apiBlogController.getBlogs);

module.exports = router;