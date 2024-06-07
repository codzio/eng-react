const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const ServiceTypeModel = require('../../models/service_type_model');
const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(
      null,
      masterHelper.slugify(path.parse(file.originalname).name) +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
  fileFilter: (req, file, cb) => {
    // Check if the file type is allowed
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
  destination: (req, file, cb) => {
    cb(null, "uploads/service-icons/");
  },
});
const upload = multer({ storage: storage });

const updateIconStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file, "---");
    cb(
      null,
      masterHelper.slugify(path.parse(file.originalname).name) +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
  fileFilter: (req, file, cb) => {
    // Check if the file type is allowed
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
  destination: (req, file, cb) => {
    cb(null, "uploads/service-icons/");
  },
});
const uploadUpdateIcon = multer({ storage: updateIconStorage });

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.serviceType = (req, res, next) => {
  ServiceTypeModel.find().sort({ _id: -1 }).then((serviceTypeData) => {
    res.render("admin/service-type/main", {
      title: masterHelper.siteTitle('Service Type'),
      currentMenu: 'service-type',
      subMenu: '',
      userData: req.session.user,
      serviceTypeData: serviceTypeData,
    });
  }).catch((err) => {
    console.log(err);
  })
}

exports.addServiceType = (req, res, next) => {  

  let defIcon = "../../media/blank.svg";

  res.render("admin/service-type/add", {
    title: masterHelper.siteTitle('Add Service Type'),
    currentMenu: 'service-type',
    subMenu: 'service-type-add',
    userData: req.session.user,
    icon: defIcon,
  });
}

exports.editServiceType = (req, res, next) => {    
  const serviceTypeId = req.params.id;

  ServiceTypeModel.findOne({_id: serviceTypeId}).then((result) => {

    if (!result) {
      return res.redirect('/admin/service-type');
    }

    let defIcon = "../../media/blank.svg";

    if (result.icon) {
      defIcon = masterHelper.siteUrl() + result.icon;
    }

    res.render("admin/service-type/edit", {
      title: masterHelper.siteTitle('Edit Service Type'),
      currentMenu: 'service-type',
      subMenu: 'service-type-edit',
      userData: req.session.user,
      serviceTypeData: result,
      icon: defIcon,
    });

  }).catch((err) => {
      console.log(err);
      return res.redirect('/admin/service-type');
  });
}

const validateIcon = [
  check("icon").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Icon is required");
    }

    if (req.file) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(
          "Invalid file type. Please upload a PNG, JPEG, or JPG image"
        );
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.file.size > maxSize) {
        throw new Error("File size exceeds the limit of 500 KB");
      }
    }

    return true;
  }),
];

const validation = [
  body('serviceName').notEmpty().trim().withMessage('The service name field is required.'),
  body('_csrf').custom(isCsrfValid),
];

exports.doAddServiceType = [  
  upload.single("icon"),
  validateIcon,
  validation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.serviceName,
      icon: req.file.path,
    }

    //save the data
    const newServiceType = new ServiceTypeModel(data);
    newServiceType.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating category.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Service type has been created successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('serviceName').notEmpty().trim().withMessage('The service name field is required.'),
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The id is required.'),
];

const validateIconWhileUpdate = [
  check("icon").custom((value, { req }) => {
    // if (!req.file) {
    //   throw new Error('Client image is required');
    // }

    if (req.file) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error(
          "Invalid file type. Please upload a PNG, JPEG, or JPG image"
        );
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.file.size > maxSize) {
        throw new Error("File size exceeds the limit of 500 KB");
      }
    }

    return true;
  }),
];


exports.doUpdateServiceType = [  
  uploadUpdateIcon.single("icon"),
  validateIconWhileUpdate,
  updateValidation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const serviceTypeId = req.body._id;    

    //check if id exist
    ServiceTypeModel.findOne({_id: serviceTypeId})
    .then((getService) => {

      if (!getService) {
        console.log(getService);
        return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
      }

      if (req.file) {
        if (getService.icon) {
          fs.unlink(
            path.join(__dirname, "../../", getService.icon),
            (err) => {
              console.log(err);
            }
          );
        }

        getService.icon = req.file.path;
      }

      getService.title = req.body.serviceName;
      return getService.save();
    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }

        return res.status(200).json({msg: 'Service name has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find service data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The service id is required.'),
];

// exports.doDeleteServiceType = [
//   validateBefDelete,
//   (req, res, next) => {

//     const serviceTypeId = req.body.id;

//     ServiceTypeModel.findByIdAndDelete(serviceTypeId)
//     .then((deleteServiceType) => {
      
//       if (deleteServiceType) {
//         return res.status(200).json({msg: 'Service name has been deleted'});
//       } else {
//         return res.status(400).json({msg: 'Service name not found.', 'eType': 'final'});
//       }

//     }).catch((err) => {
//       console.log(err);
//       return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
//     });

//   }
// ]

exports.doDeleteServiceType = [
  validateBefDelete,
  (req, res, next) => {
    const serviceTypeId = req.body.id;

    ServiceTypeModel.findOne({ _id: serviceTypeId })
      .then((serviceType) => {
        if (!serviceType) {
          return res
            .status(400)
            .json({ msg: "Unable to find service.", eType: "final" });
        }

        if (serviceType.icon) {
          fs.unlink(path.join(__dirname, "../../", serviceType.icon), (err) => {
            console.log(err);
          });
        }

        return ServiceTypeModel.findByIdAndDelete(serviceTypeId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Service has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Service not found.", eType: "final" });
        }
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      });
  },
];