const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const videoController = require("../controllers/admin/video");

router.get("/video/edit/:id", isAuth, videoController.editVideo);
router.get("/video/add", isAuth, videoController.addVideo);
router.post("/video/doAddVideo", isAuth, videoController.doAddVideo);
router.post("/video/doUpdateVideo",isAuth,videoController.doUpdateVideo);
router.post("/video/delete", isAuth, videoController.doDeleteVideo);
router.get("/video", isAuth, videoController.video);

module.exports = router;
