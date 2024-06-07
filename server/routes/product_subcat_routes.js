const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const prodSubcatController = require("../controllers/admin/product_subcategory");

router.get(
  "/product-subcategory/edit/:id",
  isAuth,
  prodSubcatController.editCategory
);

router.get(
  "/product-subcategory/add",
  isAuth,
  prodSubcatController.addCategory
);

router.post(
  "/product-subcategory/doAddCategory",
  isAuth,
  prodSubcatController.doAddCategory
);

router.post(
  "/product-subcategory/doUpdateCategory",
  isAuth,
  prodSubcatController.doUpdateCategory
);

router.post(
  "/product-subcategory/delete",
  isAuth,
  prodSubcatController.doDeleteCategory
);

router.get("/product-subcategory", isAuth, prodSubcatController.category);

module.exports = router;
