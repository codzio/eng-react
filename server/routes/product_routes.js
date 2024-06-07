const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const productController = require("../controllers/admin/product");

router.get("/product/edit/:id", isAuth, productController.editProduct);
router.get("/product/add", isAuth, productController.addProduct);

router.post("/product/doAddProduct", isAuth, productController.doAddProduct);
router.post(
  "/product/doUpdateProduct",
  isAuth,
  productController.doUpdateProduct
);
router.post(
  "/product/doDeleteAddImg",
  isAuth,
  productController.doDeleteAddImg
);
router.post("/product/doDeletePdf", isAuth, productController.doDeletePdf);
router.post("/product/delete", isAuth, productController.doDeleteProduct);
router.post(
  "/product/getSubCategory",
  isAuth,
  productController.getSubCategory
);
router.get("/product", isAuth, productController.product);

module.exports = router;
