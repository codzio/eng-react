const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const enquiryController = require("../controllers/admin/enquiry");

// router.get("/page/edit/:id", isAuth, enquiryController.editPage);
// router.get("/page/add", isAuth, enquiryController.addPage);
router.post("/enquiry/career/delete", isAuth, enquiryController.doDeleteCareerEnq);
router.post("/enquiry/contact/delete", isAuth, enquiryController.doDeleteContactEnq);
router.get("/enquiry/career", isAuth, enquiryController.career);
router.get("/enquiry/contact", isAuth, enquiryController.contact);

module.exports = router;