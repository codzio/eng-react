const path = require("path")
const express = require("express");
const router = express.Router();
const apiProdController = require("../../controllers/api/product");

router.get("/products/category", apiProdController.getCategory);
router.get("/products/:slug", apiProdController.getProductDetail);
router.get("/products/category/:id", apiProdController.getProductsByCat);

module.exports = router;