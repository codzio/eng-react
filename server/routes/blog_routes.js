const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const blogController = require("../controllers/admin/blogs");

router.get("/blogs/edit/:id", isAuth, blogController.editBlog);
router.get("/blogs/add", isAuth, blogController.addBlog);

router.post("/blogs/doAddBlog", isAuth, blogController.doAddBlog);
router.post("/blogs/doUpdateBlog", isAuth, blogController.doUpdateBlog);
router.post("/blogs/delete", isAuth, blogController.doDeleteBlog);

router.get("/blogs", isAuth, blogController.blog);

module.exports = router;