const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const annualReportController = require("../controllers/admin/annual-report");

router.get("/annual-report/edit/:id", isAuth, annualReportController.editAnnualReport);
router.get("/annual-report/add", isAuth, annualReportController.addAnnualReport);
router.post("/annual-report/doAddAnnualReport", isAuth, annualReportController.doAddAnnualReport);
router.post("/annual-report/doUpdateAnnualReport",isAuth,annualReportController.doUpdateAnnualReport);
router.post("/annual-report/delete", isAuth, annualReportController.doDeleteAnnualReport);
router.get("/annual-report", isAuth, annualReportController.annualReport);

module.exports = router;
