const { body, check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const fs = require("fs");
const path = require("path")
const SiteSettingModel = require('../../models/site_settings_model');
const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, masterHelper.slugify(path.parse(file.originalname).name) + path.extname(file.originalname));
  },
  fileFilter: (req, file, cb) => {
    // Check if the file type is allowed
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
  destination: (req, file, cb) => {
    cb(null, 'uploads/site-setting/');
  }
});
const upload = multer({ storage: storage });

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

const removeFile = (imgPath) => {
  fs.unlink(path.join(__dirname, '../../', imgPath), (err) => {
    console.log('file remove', err);
  });
}

exports.siteSettings = (req, res, next) => {

  let defImg = "../media/blank.svg";

  SiteSettingModel.findOne().then((getSettings) => {
    res.render("admin/site_setting/main", {
      title: masterHelper.siteTitle('Site Settings'),
      currentMenu: 'site-settings',
      subMenu: '',
      userData: req.session.user,
      settingData: getSettings,
      adminLogo: (getSettings && getSettings.adminLogo)? masterHelper.siteUrl() + getSettings.adminLogo:defImg,
      websiteLogo: (getSettings && getSettings.websiteLogo)? masterHelper.siteUrl() + getSettings.websiteLogo:defImg,
      loginPageImg: (getSettings && getSettings.loginPageImg)? masterHelper.siteUrl() + getSettings.loginPageImg:defImg,
      favicon: (getSettings && getSettings.favicon)? masterHelper.siteUrl() + getSettings.favicon:defImg,
    });

  }).catch((err) => {
    console.log(err);
  })
}

const validateGeneralSettingForm = [
  body('websiteName').notEmpty().trim().withMessage('The website name field is required.'),
  body('websiteEmail').trim().isEmail().withMessage('Invalid email address'),
  body('websitePhoneNum').optional({ nullable: true, checkFalsy: true })
  .isNumeric().withMessage('The phone number must be numeric.')
  .isLength({ min: 10, max: 15 }).withMessage('The phone number must be 10 digit long.'),
  body('websiteAddress').optional({ nullable: true, checkFalsy: true }).trim(),
  body('websiteCopyright').notEmpty().trim().withMessage('The copyright field is required.'),
  body('_csrf').custom(isCsrfValid),
];

const validateAdminLogo = [
  check('adminLogo').custom((value, { req }) => {

    if (!req.files['adminLogo'] && req.body._id == '') {
      throw new Error('Admin logo is required');
    } else if (req.body.adminLogo_remove) {
      throw new Error('Admin logo is required');
    }

    if (req.files['adminLogo']) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(req.files['adminLogo'][0].mimetype)) {
        throw new Error('Invalid file type. Please upload a PNG, JPEG, SVG, or JPG image');
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.files['adminLogo'][0].size > maxSize) {
        throw new Error('Admin logo size exceeds the limit of 500 KB');
      }
    }

    return true;

  }),
];

const validateWebsiteLogo = [
  check('websiteLogo').custom((value, { req }) => {
    
    if (!req.files['websiteLogo']  && req.body._id == '') {
      throw new Error('Website logo is required');
    } else if (req.body.websiteLogo_remove) {
      throw new Error('Website logo is required');
    }

    if (req.files['websiteLogo']) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(req.files['websiteLogo'][0].mimetype)) {
        throw new Error('Invalid file type. Please upload a PNG, JPEG, SVG, or JPG image');
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.files['websiteLogo'][0].size > maxSize) {
        throw new Error('Website logo size exceeds the limit of 500 KB');
      }
    }

    return true;

  }),
];

const validateLoginPageImgLogo = [
  check('loginPageImg').custom((value, { req }) => {
    
    if (!req.files['loginPageImg']  && req.body._id == '') {
      throw new Error('Login page image is required');
    } else if (req.body.loginPageImg_remove) {
      throw new Error('Login page image is required');
    }

    if (req.files['loginPageImg']) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(req.files['loginPageImg'][0].mimetype)) {
        throw new Error('Invalid file type. Please upload a PNG, JPEG, SVG, or JPG image');
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.files['loginPageImg'][0].size > maxSize) {
        throw new Error('Login page image size exceeds the limit of 500 KB');
      }
    }

    return true;

  }),
];

const validateFaviconLogo = [
  check('favicon').custom((value, { req }) => {
    
    if (!req.files['favicon']  && req.body._id == '') {
      throw new Error('Favicon is required 2');
    } else if (req.body.favicon_remove) {
      throw new Error('Favicon is required 1');
    }

    if (req.files['favicon']) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
      if (!allowedTypes.includes(req.files['favicon'][0].mimetype)) {
        throw new Error('Invalid file type. Please upload a PNG, JPEG, SVG, or JPG image');
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.files['favicon'][0].size > maxSize) {
        throw new Error('Favicon size exceeds the limit of 500 KB');
      }
    }

    return true;

  }),
];

exports.doUpdateGeneralSettings = [  
  upload.fields([
    { name: 'adminLogo', maxCount: 1 },
    { name: 'websiteLogo', maxCount: 1 },
    { name: 'loginPageImg', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
  ]),
  validateAdminLogo,
  validateWebsiteLogo,
  validateLoginPageImgLogo,
  validateFaviconLogo,
  validateGeneralSettingForm, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }
      
    const _id = req.body._id;

    //find the data by id
    SiteSettingModel.findOne({_id: _id}).then(getSiteSettings => {

      getSiteSettings.websiteName = req.body.websiteName;
      getSiteSettings.websiteEmail = req.body.websiteEmail;
      getSiteSettings.websitePhone = req.body.websitePhoneNum;
      getSiteSettings.websiteAddress = req.body.websiteAddress;
      getSiteSettings.copyright = req.body.websiteCopyright;
      getSiteSettings.footerDescription = req.body.footerDescription;

      if (req.files['adminLogo']) {
        //remove image
        removeFile(getSiteSettings.adminLogo);
        getSiteSettings.adminLogo = req.files['adminLogo'][0].path;
      }

      if (req.files['websiteLogo']) {
        removeFile(getSiteSettings.websiteLogo);
        getSiteSettings.websiteLogo = req.files['websiteLogo'][0].path;
      }

      if (req.files['loginPageImg']) {
        removeFile(getSiteSettings.loginPageImg);
        getSiteSettings.loginPageImg = req.files['loginPageImg'][0].path;        
      }

      if (req.files['favicon']) {
        removeFile(getSiteSettings.favicon);
        getSiteSettings.favicon = req.files['favicon'][0].path;
      }

      return getSiteSettings.save();

    }).then(result => {        
        if (!result) {
          return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'General settings has been updated sucessfully.'});
    }).catch(err => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const validateCustomSettingForm = [ 
  body('headerScripts').optional({ nullable: true, checkFalsy: true }).trim(),
  body('footerScripts').optional({ nullable: true, checkFalsy: true }).trim(),  
  body('_csrf').custom(isCsrfValid),
];


exports.doUpdateCustomSettings = [  
  validateCustomSettingForm, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }
      
    const _id = req.body._id;

    //find the data by id
    SiteSettingModel.findOne({_id: _id}).then(getSiteSettings => {

      getSiteSettings.scripts = {
        header: (req.body.headerScripts)? req.body.headerScripts:null,
        footer: (req.body.footerScripts)? req.body.footerScripts:null
      }

      return getSiteSettings.save();

    }).then(result => {        
        if (!result) {
          console.log(result);
          return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'Custom scripts has been updated sucessfully.'});
    }).catch(err => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const validateSocialSettingForm = [ 
  body('facebook').optional({ nullable: true, checkFalsy: true }).trim(),
  body('twitter').optional({ nullable: true, checkFalsy: true }).trim(),  
  body('instagram').optional({ nullable: true, checkFalsy: true }).trim(),  
  body('youtube').optional({ nullable: true, checkFalsy: true }).trim(),  
  body('linkedin').optional({ nullable: true, checkFalsy: true }).trim(),  
  body('_csrf').custom(isCsrfValid),
];


exports.doUpdateSocialSettings = [  
  validateSocialSettingForm, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }
      
    const _id = req.body._id;

    //find the data by id
    SiteSettingModel.findOne({_id: _id}).then(getSiteSettings => {

      getSiteSettings.socialLinks = {
        facebook: (req.body.facebook)? req.body.facebook:null,
        twitter: (req.body.twitter)? req.body.twitter:null,
        instagram: (req.body.instagram)? req.body.instagram:null,
        youtube: (req.body.youtube)? req.body.youtube:null,
        linkedin: (req.body.linkedin)? req.body.linkedin:null,
      }

      return getSiteSettings.save();

    }).then(result => {        
        if (!result) {
          console.log(result);
          return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'Social links has been updated sucessfully.'});
    }).catch(err => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];