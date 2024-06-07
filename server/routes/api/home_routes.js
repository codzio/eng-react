const path = require("path");
const express = require("express");
const router = express.Router();
const apiHomeController = require("../../controllers/api/home");

router.get("/home", apiHomeController.getHomePage);
router.get("/comman", apiHomeController.getComman);
router.get("/gallery", apiHomeController.getGalleryData);

router.post("/contact", apiHomeController.postContact);
router.post("/career", apiHomeController.postCareer);
router.post("/enquiry", apiHomeController.postEnquiry);

router.get("/page/:slug", apiHomeController.getPageData);
router.get("/projects/:slug", apiHomeController.getProjectData);

router.get("/productCat/:slug?", apiHomeController.getProductCat);
router.get("/jobs/:slug?", apiHomeController.getJobs);
router.get("/search", apiHomeController.getSearch);

router.get("/annual-report", apiHomeController.getAnnualReport);
router.get("/videos", apiHomeController.getVideos);

module.exports = router;
