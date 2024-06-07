const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const useCasesController = require("../controllers/admin/use_cases");

router.get("/use-cases/edit/:id", isAuth, useCasesController.editUseCases);
router.get("/use-cases/add", isAuth, useCasesController.addUseCases);

router.post("/use-cases/doAddUseCases", isAuth, useCasesController.doAddUseCases);
router.post("/use-cases/doUpdateUseCases", isAuth, useCasesController.doUpdateUseCases);
router.post("/use-cases/delete", isAuth, useCasesController.doDeleteUseCases);

router.get("/use-cases", isAuth, useCasesController.useCases);

module.exports = router;