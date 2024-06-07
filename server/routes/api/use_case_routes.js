const path = require("path")
const express = require("express");
const router = express.Router();
const apiUseCaseController = require("../../controllers/api/use_case");

router.get("/use-cases/", apiUseCaseController.getCases);

module.exports = router;