const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const UseCasesModel = require('../../models/use_cases_model');
const ServiceType = require('../../models/service_type_model');
const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');

const storage = multer.diskStorage({
  filename: (req, file, cb) => {    
    cb(null, 
      masterHelper.slugify(path.parse(file.originalname).name) + '-' +
      Date.now() +
      path.extname(file.originalname)
    );
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
    cb(null, 'uploads/use-cases/');
  }
});
const upload = multer({ storage: storage });


const updateUseCaseStorage = multer.diskStorage({
  filename: (req, file, cb) => {
    console.log(file, '---');
    cb(null, 
      masterHelper.slugify(path.parse(file.originalname).name) + '-' +
      Date.now() +
      path.extname(file.originalname)
    );
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
    cb(null, 'uploads/use-cases/');
  }
});
const uploadUpdateUseCase = multer({ storage: updateUseCaseStorage });


const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.useCases = (req, res, next) => {
  UseCasesModel.find().sort({ _id: -1 })
  .then((useCaseData) => {
      res.render("admin/use-cases/main", {
        title: masterHelper.siteTitle('Use Cases'),
        currentMenu: 'use-cases',
        subMenu: '',
        userData: req.session.user,
        useCaseData: useCaseData,
      });
    }).catch((err) => {
      console.log(err);
  })
}

exports.addUseCases = async (req, res, next) => {
  try {

    const serviceType = await ServiceType.find();
    // Add multiple models to fetch data

    let defImg = "../../media/blank.svg";
    res.render("admin/use-cases/add", {
      title: masterHelper.siteTitle('Add Use Case'),
      currentMenu: 'use-cases',
      subMenu: 'use-cases-add',
      userData: req.session.user,
      useCaseImg: defImg,
      serviceType: serviceType
    });

  } catch(err) {
    console.error('Error retrieving data:', err);
    return res.status(500).send('Internal Server Error');
  }
}

exports.editUseCases = async (req, res, next) => {    
    
    try {

      const useCaseId = req.params.id;
      const serviceType = await ServiceType.find();

      UseCasesModel
      .findById({_id: useCaseId})
      // .populate('services') // Populate the books field with book documents
      // .exec()
      .then((result) => {

        if (!result) {
          return res.redirect('/admin/use-cases');
        }

        let defImg = "../../media/blank.svg";
        
        if (result.image) {
          defImg = masterHelper.siteUrl() + result.image;
        }

        let clientList = '';

        if (result.clients) {
          clientList = JSON.stringify(result.clients);
        }

        res.render("admin/use-cases/edit", {
          title: masterHelper.siteTitle('Edit Use Case'),
          currentMenu: 'use-cases',
          subMenu: 'use-cases-edit',
          userData: req.session.user,
          useCaseData: result,
          useCaseImg: defImg,
          serviceType: serviceType,
          clientList: clientList,
          selServices: result.services,      
        });

      }).catch((err) => {
          console.log(err, 'errro');
          return res.redirect('/admin/use-cases');
      });

    } catch(err) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  
}

const validateUseCaseImg = [
  check('useCaseImg').custom((value, { req }) => {
    
    if (!req.file) {
      throw new Error('Use case image is required');
    }

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

const validation = [
  body('title').notEmpty().trim().withMessage('The title field is required.'),
  // body('slug').notEmpty().trim().withMessage('The slug field is required.')
  // .custom(async value => {
  //   newValue = masterHelper.slugify(value);    
    
  //   const isSlugExist = await UseCasesModel.findOne({ slug: newValue });
  //   if (isSlugExist) {
  //     throw new Error('The slug is already in used.');
  //   }

  //   return true;
  // }),
  body('slug').notEmpty().trim().withMessage('The title field is required.'),
  // body('location').notEmpty().trim().withMessage('The location field is required.'),
  body('location').optional({ nullable: true, checkFalsy: true }), 
  body('serviceType').isArray({ min: 1 }).withMessage('The service type field is required.')
  .custom(async value => {
    getServiceTypeId = value;

    if (typeof getServiceTypeId === 'undefined') {
      throw new Error('The service type field is required.');
    }

    const isServiceTypeExist = await ServiceType.findOne({ _id: getServiceTypeId });

    if (!isServiceTypeExist) {
      throw new Error('The service type is not matched. Please select the correct service type.');
    }

    return true;

  }),
  body('clients').isArray().optional({ nullable: true, checkFalsy: true }).withMessage('The Client field should be an array.'),
  body('homepage').trim().notEmpty().isBoolean().withMessage('Display on homepage field is required.'),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
];

exports.doAddUseCases = [
  upload.single('useCaseImg'), 
  validateUseCaseImg,
  validation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const newClients = [];

    var getClientData = req.body.clients.filter(function (el) {
      return el != '';
    });

    if (getClientData.length != 0) {
      getClients = JSON.parse(req.body.clients);
      getClients.forEach((item) => {
        newClients.push(item.value);
      })
    }

    const data = {
      title: req.body.title,
      slug: masterHelper.slugify(req.body.slug),
      location: req.body.location,
      image: req.file.path,
      description: req.body.description,
      services: req.body.serviceType,
      clients: newClients,
      homepage: req.body.homepage,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    }

    //save the data
    const newUseCase = new UseCasesModel(data);
    newUseCase.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating blog.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Use Case has been added successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('title').notEmpty().trim().withMessage('The title field is required.'),
  body('slug').notEmpty().trim().withMessage('The title field is required.'),
  // body('slug').notEmpty().trim().withMessage('The slug field is required.')
  // .custom(async (value, { req }) => {
  //   newValue = masterHelper.slugify(value);    
    
  //   const isSlugExist = await UseCasesModel.findOne({ 
  //     slug: newValue,
  //     _id: { $ne: req.body._id },
  //   });

  //   if (isSlugExist) {
  //     throw new Error('The slug is already in used.');
  //   }

  //   return true;
  // }),
  // body('location').notEmpty().trim().withMessage('The location field is required.'),
  body('location').optional({ nullable: true, checkFalsy: true }), 
  body('serviceType').isArray({ min: 1 }).withMessage('The service type field is required.')
  .custom(async value => {
    getServiceTypeId = value;

    if (typeof getServiceTypeId === 'undefined') {
      throw new Error('The service type field is required.');
    }

    const isServiceTypeExist = await ServiceType.findOne({ _id: getServiceTypeId });

    if (!isServiceTypeExist) {
      throw new Error('The service type is not matched. Please select the correct service type.');
    }

    return true;

  }),
  body('clients').isArray().optional({ nullable: true, checkFalsy: true }).withMessage('The Client field should be an array.'),
  body('homepage').trim().notEmpty().isBoolean().withMessage('Display on homepage field is required.'),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The blog id is required.'),  
];

const validateUseCaseImgWhileUpdate = [
  check('useCaseImg').custom((value, { req }) => {
    
    // if (!req.file) {
    //   throw new Error('Blog image is required');
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

exports.doUpdateUseCases = [
  uploadUpdateUseCase.single('useCaseImg'),
  validateUseCaseImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const useCaseId = req.body._id;

    //check if id exist
    UseCasesModel.findOne({_id: useCaseId})
    .then((useCase) => {

      if (!useCase) {
        console.log(useCase);
        return res.status(400).json({msg: 'Unable to find use case', 'eType': 'final'});
      }

      if (req.file) {

        if (useCase.image) {
          fs.unlink(path.join(__dirname, '../../', useCase.image), (err) => {
            console.log(err);
          });
        }
        
        useCase.image = req.file.path;

      }

      const myClients = useCase.clients;
      const newClients = [];
      const allClients = Array.isArray(req.body.clients) ? req.body.clients : [req.body.clients];

      // if (req.body.clients) {
      //   getClients = JSON.parse(req.body.clients);
      //   getClients.forEach((item) => {
      //     newClients.push(item.value);
      //   })
      // }

      allClients.forEach((clientsField) => {
          if (clientsField) {
              const getClients = JSON.parse(clientsField);
              getClients.forEach((item) => {
                  newClients.push(item.value);
              });
          }
      });

      useCase.title = req.body.title;
      useCase.slug = masterHelper.slugify(req.body.slug);
      useCase.location = req.body.location;
      useCase.description = req.body.description;
      useCase.services = req.body.serviceType;
      useCase.clients = newClients? newClients:myClients;
      useCase.homepage = req.body.homepage;
      useCase.metaTitle = req.body.metaTitle;
      useCase.metaDescription = req.body.metaDescription;
      return useCase.save();
    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'Use case has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find use case data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The use case id is required.'),
];

exports.doDeleteUseCases = [
  validateBefDelete,
  (req, res, next) => {

    const useCaseId = req.body.id;

    UseCasesModel.findOne({_id: useCaseId}).then((useCase) => {

      if (!useCase) {
        return res.status(400).json({msg: 'Unable to find use case.', 'eType': 'final'});
      }

      if (useCase.image) {
        fs.unlink(path.join(__dirname, '../../', useCase.image), (err) => {
          console.log(err);
        });
      }

      return UseCasesModel.findByIdAndDelete(useCaseId);

    })
    .then((isDel) => {
      
      if (isDel) {
        return res.status(200).json({msg: 'Use case has been deleted'});
      } else {
        return res.status(400).json({msg: 'Use case not found.', 'eType': 'final'});
      }

    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]