const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const bannerController = require("../controllers/admin/banner");

router.get("/banner/edit/:id", isAuth, bannerController.editBanner);
router.get("/banner/add", isAuth, bannerController.addBanner);

router.post("/banner/doAddBanner", isAuth, bannerController.doAddBanner);
router.post("/banner/doUpdateBanner", isAuth, bannerController.doUpdateBanner);
router.post("/banner/delete", isAuth, bannerController.doDeleteBanner);

router.get("/banner", isAuth, bannerController.banner);

module.exports = router;