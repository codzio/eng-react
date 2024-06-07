const multer = require("multer");
const path = require("path")
const express = require("express");
const router = express.Router();

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Convert spaces and underscores to dashes
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

// Configure multer for file uploads
//const storage = multer.memoryStorage();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {  	
    cb(null, 'uploads/users/profile_images/');
  },
  filename: function (req, file, cb) {
  	const userId = req.session.user.userId;
    cb(null, userId + '-' + slugify(path.parse(file.originalname).name) + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

const { body, check, validationResult } = require('express-validator');

const isAuth = require('../middleware/admin-middleware');
const csrfHelper = require('../helpers/csrf');

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

//import controllers
const authController = require("../controllers/admin/auth");

const validateLoginForm = [
	body('email').trim().isEmail().withMessage('Invalid email address'),
  	body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  	body('_csrf').custom(isCsrfValid),
];

router.post("/doAuth", validateLoginForm, authController.doAuth);

const validateProfileForm = [
	body('name').notEmpty().trim().withMessage('The name field is required.'),
	body('phone').optional({ nullable: true, checkFalsy: true })
	.isNumeric().withMessage('The phone number must be numeric.')
	.isLength({ min: 10, max: 15 }).withMessage('The phone number must be 10 digit long.'),
	body('address').optional({ nullable: true, checkFalsy: true }).trim(),
	body('_csrf').custom(isCsrfValid),
];

const validateProfileImg = [
  check('profileImg').custom((value, { req }) => {
    
    // if (!req.file) {
    //   throw new Error('Profile image is required');
    // }

    if (req.file) {
    	// Check file type (accept png, jpeg, jpg)
	    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
	    if (!allowedTypes.includes(req.file.mimetype)) {
	      throw new Error('Invalid file type. Please upload a PNG, JPEG, or JPG image');
	    }

	    // Check file size (max 500 KB)
	    const maxSize = 500 * 1024; // 500 KB in bytes
	    if (req.file.size > maxSize) {
	      throw new Error('File size exceeds the limit of 500 KB');
	    }
    }

    return true;

  }),
];

router.post("/doUpdateProfile", 
	upload.single('profileImg'),
	validateProfileForm,
	validateProfileImg,
	isAuth,
	authController.doUpdateProfile
);

const validateUpdateEmailForm = [
	body('emailAddress').trim().isEmail().withMessage('Please enter the valid email address.'),
	body('confirmEmailPassword').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
	body('_csrf').custom(isCsrfValid),
];

router.post("/doUpdateEmail", validateUpdateEmailForm, isAuth, authController.doUpdateEmail);

const validateChangePassForm = [
	body('currentpassword').notEmpty().isLength({ min: 6 }).withMessage('Current Password must be at least 6 characters'),
    body('newpassword').notEmpty().isLength({ min: 6 }).withMessage('New Password must be at least 6 characters'),
    body('confirmpassword')
      .notEmpty().isLength({ min: 6 }).withMessage('Confirm Password must be at least 6 characters')
      .withMessage('Confirm password is required')
      .custom((value, { req }) => {
        if (value !== req.body.newpassword) {
          throw new Error('Confirm password does not match');
        }
        return true;
      }),

	body('_csrf').custom(isCsrfValid),
];

router.post("/doChangePass", validateChangePassForm, isAuth, authController.doChangePass);
router.get("/logout", isAuth, authController.doLogout);
router.get("/dashboard", isAuth, authController.dashboard);
router.get("/account-settings", isAuth, authController.accountSettings);
router.get("/", authController.login);

module.exports = router;
