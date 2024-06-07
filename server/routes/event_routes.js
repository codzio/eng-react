const path = require("path");
const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/admin-middleware");

//import controller
const eventController = require("../controllers/admin/event");

router.get("/event/edit/:id", isAuth, eventController.editEvent);
router.get("/event/add", isAuth, eventController.addEvent);

router.post("/event/doAddEvent", isAuth, eventController.doAddEvent);
router.post("/event/doUpdateEvent", isAuth, eventController.doUpdateEvent);
router.post("/event/delete", isAuth, eventController.doDeleteEvent);

router.get("/event", isAuth, eventController.event);

module.exports = router;
