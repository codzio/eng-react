const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const whyController = require("../controllers/admin/why");

router.get("/why/edit/:id", isAuth, whyController.editWhy);
router.get("/why/add", isAuth, whyController.addWhy);

router.post("/why/doAddWhy", isAuth, whyController.doAddWhy);
router.post("/why/doUpdateWhy", isAuth, whyController.doUpdateWhy);
router.post("/why/delete", isAuth, whyController.doDeleteWhy);

router.get("/why", isAuth, whyController.why);

module.exports = router;
