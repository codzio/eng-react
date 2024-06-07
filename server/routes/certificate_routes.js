const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const certController = require("../controllers/admin/certificate");

router.get("/certificate/edit/:id", isAuth, certController.editCertificate);
router.get("/certificate/add", isAuth, certController.addCertificate);

router.post("/certificate/doAddCertificate", isAuth, certController.doAddCertificate);
router.post("/certificate/doUpdateCertificate", isAuth, certController.doUpdateCertificate);
router.post("/certificate/delete", isAuth, certController.doDeleteCertificate);

router.get("/certificate", isAuth, certController.certificate);

module.exports = router;