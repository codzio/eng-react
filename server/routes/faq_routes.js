const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const faqController = require("../controllers/admin/faq");

router.get("/faq/edit/:id", isAuth, faqController.editFaq);
router.get("/faq/add", isAuth, faqController.addFaq);

router.post("/faq/doAddFaq", isAuth, faqController.doAddFaq);
router.post("/faq/doUpdateFaq", isAuth, faqController.doUpdateFaq);
router.post("/faq/delete", isAuth, faqController.doDeleteFaq);

router.get("/faq", isAuth, faqController.faq);

module.exports = router;