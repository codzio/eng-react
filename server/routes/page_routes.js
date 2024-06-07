const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const pageController = require("../controllers/admin/page");

router.get("/page/edit/:id", isAuth, pageController.editPage);
router.get("/page/add", isAuth, pageController.addPage);

router.post("/page/doAddPage", isAuth, pageController.doAddPage);
router.post("/page/doUpdatePage", isAuth, pageController.doUpdatePage);
// router.post("/page/delete", isAuth, pageController.doDeletePage);

router.get("/page", isAuth, pageController.page);

module.exports = router;