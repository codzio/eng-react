const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const clientController = require("../controllers/admin/client");

router.get("/client/edit/:id", isAuth, clientController.editClient);
router.get("/client/add", isAuth, clientController.addClient);

router.post("/client/doAddClient", isAuth, clientController.doAddClient);
router.post("/client/doUpdateClient", isAuth, clientController.doUpdateClient);
router.post("/client/delete", isAuth, clientController.doDeleteClient);

router.get("/client", isAuth, clientController.client);

module.exports = router;