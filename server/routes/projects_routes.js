const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const projectController = require("../controllers/admin/projects");

router.get("/projects/edit/:id", isAuth, projectController.editProject);
router.get("/projects/add", isAuth, projectController.addProject);

router.post("/projects/doAddProject", isAuth, projectController.doAddProject);
router.post("/projects/doUpdateProject", isAuth, projectController.doUpdateProject);
router.post("/projects/delete", isAuth, projectController.doDeleteProject);

router.get("/projects", isAuth, projectController.project);

module.exports = router;