const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const prodCatController = require("../controllers/admin/product_category");

router.get("/product-category/edit/:id", isAuth, prodCatController.editCategory);
router.get("/product-category/add", isAuth, prodCatController.addCategory);

router.post("/product-category/doAddCategory", isAuth, prodCatController.doAddCategory);
router.post("/product-category/doUpdateCategory", isAuth, prodCatController.doUpdateCategory);
router.post("/product-category/delete", isAuth, prodCatController.doDeleteCategory);

router.get("/product-category", isAuth, prodCatController.category);

module.exports = router;