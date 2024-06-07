const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const serviceTypeController = require("../controllers/admin/service_type");

router.get("/service-type/edit/:id", isAuth, serviceTypeController.editServiceType);
router.get("/service-type/add", isAuth, serviceTypeController.addServiceType);

router.post("/service-type/doAddServiceType", isAuth, serviceTypeController.doAddServiceType);
router.post("/service-type/doUpdateServiceType", isAuth, serviceTypeController.doUpdateServiceType);
router.post("/service-type/delete", isAuth, serviceTypeController.doDeleteServiceType);

router.get("/service-type", isAuth, serviceTypeController.serviceType);

module.exports = router;