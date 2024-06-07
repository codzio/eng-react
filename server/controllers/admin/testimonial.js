const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const TestimonialModel = require('../../models/testimonial_model');
const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.testimonial = (req, res, next) => {
  TestimonialModel.find().sort({ _id: -1 }).then((testimonialData) => {
    res.render("admin/testimonial/main", {
      title: masterHelper.siteTitle('Testimonial'),
      currentMenu: 'testimonial',
      subMenu: '',
      userData: req.session.user,
      testimonialData: testimonialData,
    });
  }).catch((err) => {
    console.log(err);
  })
}

exports.addTestimonial = (req, res, next) => {  
  res.render("admin/testimonial/add", {
    title: masterHelper.siteTitle('Add Testimonial'),
    currentMenu: 'testimonial',
    subMenu: 'testimonial-add',
    userData: req.session.user,
  });
}

exports.editTestimonial = (req, res, next) => {    
  const testimonialId = req.params.id;

  TestimonialModel.findOne({_id: testimonialId}).then((result) => {

    if (!result) {
      return res.redirect('/admin/testimonial');
    }

    res.render("admin/testimonial/edit", {
      title: masterHelper.siteTitle('Edit Testimonial'),
      currentMenu: 'testimonial',
      subMenu: 'testimonial-edit',
      userData: req.session.user,
      testimonialData: result
    });

  }).catch((err) => {
      console.log(err);
      return res.redirect('/admin/testimonial');
  });
}

const validation = [
  body('name').notEmpty().trim().withMessage('The name field is required.'),
  body('designation').optional({ nullable: true, checkFalsy: true }),
  body('review').notEmpty().trim().withMessage('The review field is required.'),
  body('_csrf').custom(isCsrfValid),
];

exports.doAddTestimonial = [  
  validation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      name: req.body.name,
      designation: req.body.designation,
      review: req.body.review,      
    }

    //save the data
    const newTestimonial = new TestimonialModel(data);
    newTestimonial.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while adding testimonial.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Testimonial has been created successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('name').notEmpty().trim().withMessage('The name field is required.'),
  body('designation').optional({ nullable: true, checkFalsy: true }),
  body('review').notEmpty().trim().withMessage('The review field is required.'),
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The category id is required.'),
];

exports.doUpdateTestimonial = [  
  updateValidation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const testimonialId = req.body._id;    

    //check if id exist
    TestimonialModel.findOne({_id: testimonialId})
    .then((getTestimonial) => {

      if (!getTestimonial) {
        console.log(getTestimonial);
        return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
      }

      getTestimonial.name = req.body.name;      
      getTestimonial.designation = req.body.designation;
      getTestimonial.review = req.body.review;      
      return getTestimonial.save();
    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }

        return res.status(200).json({msg: 'Testimonial has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find testimonial data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The testimonial id is required.'),
];

exports.doDeleteTestimonial = [
  validateBefDelete,
  (req, res, next) => {

    const testimonialId = req.body.id;

    TestimonialModel.findByIdAndDelete(testimonialId)
    .then((deleteTestimonial) => {
      
      if (deleteTestimonial) {
        return res.status(200).json({msg: 'Testimonial has been deleted'});
      } else {
        return res.status(400).json({msg: 'Testimonial not found.', 'eType': 'final'});
      }      

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]