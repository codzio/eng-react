const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const categoryController = require("../controllers/admin/category");

router.get("/category/edit/:id", isAuth, categoryController.editCategory);
router.get("/category/add", isAuth, categoryController.addCategory);

router.post("/category/doAddCategory", isAuth, categoryController.doAddCategory);
router.post("/category/doUpdateCategory", isAuth, categoryController.doUpdateCategory);
router.post("/category/delete", isAuth, categoryController.doDeleteCategory);

router.get("/category", isAuth, categoryController.category);

module.exports = router;