const path = require("path")
const express = require("express");
const router = express.Router();
const isAuth = require('../middleware/admin-middleware');

//import controller
const testimonialController = require("../controllers/admin/testimonial");

router.get("/testimonial/edit/:id", isAuth, testimonialController.editTestimonial);
router.get("/testimonial/add", isAuth, testimonialController.addTestimonial);

router.post("/testimonial/doAddTestimonial", isAuth, testimonialController.doAddTestimonial);
router.post("/testimonial/doUpdateTestimonial", isAuth, testimonialController.doUpdateTestimonial);
router.post("/testimonial/delete", isAuth, testimonialController.doDeleteTestimonial);

router.get("/testimonial", isAuth, testimonialController.testimonial);

module.exports = router;