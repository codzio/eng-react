const multer = require("multer");
const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import site settings controllers
const siteSettingController = require("../controllers/admin/site_settings");

router.get("/site-settings", isAuth, siteSettingController.siteSettings);
router.post("/doUpdateGeneralSettings", isAuth, siteSettingController.doUpdateGeneralSettings);
router.post("/doUpdateCustomSettings", isAuth, siteSettingController.doUpdateCustomSettings);
router.post("/doUpdateSocialSettings", isAuth, siteSettingController.doUpdateSocialSettings);

module.exports = router;