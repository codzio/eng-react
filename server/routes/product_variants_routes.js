const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const productVariantsController = require("../controllers/admin/product_variants");

router.get(
  "/product-variants/edit/:id",
  isAuth,
  productVariantsController.editProductVariant
);
router.get(
  "/product-variants/add",
  isAuth,
  productVariantsController.addProductVariant
);

router.post(
  "/product-variants/doAddProductVariant",
  isAuth,
  productVariantsController.doAddProductVariant
);
router.post(
  "/product-variants/doUpdateProductVariants",
  isAuth,
  productVariantsController.doUpdateProductVariants
);
router.post(
  "/product-variants/doDeleteAddImg",
  isAuth,
  productVariantsController.doDeleteAddImg
);
router.post(
  "/product-variants/doDeletePdf",
  isAuth,
  productVariantsController.doDeletePdf
);
router.post(
  "/product-variants/delete",
  isAuth,
  productVariantsController.doDeleteProductVariants
);
router.get(
  "/product-variants",
  isAuth,
  productVariantsController.productVariants
);

module.exports = router;
