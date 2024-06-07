const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const productFeaturesController = require("../controllers/admin/product_features");

router.get("/product-features/edit/:id", isAuth, productFeaturesController.editProductFeatures);
router.get("/product-features/add", isAuth, productFeaturesController.addProductFeatures);

router.post("/product-features/doAddProductFeature", isAuth, productFeaturesController.doAddProductFeatures);
router.post("/product-features/doUpdateProductFeature", isAuth, productFeaturesController.doUpdateProductFeatures);
router.post("/product-features/delete", isAuth, productFeaturesController.doDeleteProductFeatures);

router.get("/product-features", isAuth, productFeaturesController.productFeatures);

module.exports = router;
