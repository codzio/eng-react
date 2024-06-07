const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const jobController = require("../controllers/admin/job");
router.get("/job/add", isAuth, jobController.addJob);
router.post("/job/doAddJob", isAuth, jobController.doAddJob);

router.get("/job/edit/:id", isAuth, jobController.editJob);
router.post("/job/doUpdateJob", isAuth, jobController.doUpdateJob);

router.post("/job/delete", isAuth, jobController.doDeleteJob);
router.get("/job", isAuth, jobController.job);

module.exports = router;
