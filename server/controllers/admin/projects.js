const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const ProjectModel = require('../../models/project_model');
const ProductModel = require('../../models/product_model');
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
    cb(null, 'uploads/projects/');
  }
});
const upload = multer({ storage: storage });


const updateProjectStorage = multer.diskStorage({
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
    cb(null, 'uploads/projects/');
  }
});
const uploadUpdateProject = multer({ storage: updateProjectStorage });


const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.project = (req, res, next) => {
  ProjectModel.find().sort({ _id: -1 })
  .then((projectData) => {
      res.render("admin/projects/main", {
        title: masterHelper.siteTitle('Projects'),
        currentMenu: 'projects',
        subMenu: '',
        userData: req.session.user,
        projectData: projectData,
      });
    }).catch((err) => {
      console.log(err);
  })
}

exports.addProject = async (req, res, next) => {
  try {

    const products = await ProductModel.find();
    // Add multiple models to fetch data

    let defImg = "../../media/blank.svg";
    res.render("admin/projects/add", {
      title: masterHelper.siteTitle('Add Projects'),
      currentMenu: 'projects',
      subMenu: 'projects-add',
      userData: req.session.user,
      projectImg: defImg,
      products: products
    });

  } catch(err) {
    console.error('Error retrieving data:', err);
    return res.status(500).send('Internal Server Error');
  }
}

exports.editProject = async (req, res, next) => {    
    
    try {

      const projectId = req.params.id;
      const products = await ProductModel.find();

      ProjectModel
      .findById({_id: projectId})
      // .populate('services') // Populate the books field with book documents
      // .exec()
      .then((result) => {

        if (!result) {
          return res.redirect('/admin/projects');
        }

        let defImg = "../../media/blank.svg";
        
        if (result.image) {
          defImg = masterHelper.siteUrl() + result.image;
        }

        res.render("admin/projects/edit", {
          title: masterHelper.siteTitle('Edit Project'),
          currentMenu: 'projects',
          subMenu: 'projects-edit',
          userData: req.session.user,
          projectData: result,
          projectImg: defImg,
          products: products,
          selProjects: result.products,      
        });

      }).catch((err) => {
          console.log(err, 'errro');
          return res.redirect('/admin/projects');
      });

    } catch(err) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  
}

const validateProjectImg = [
  check('projectImg').custom((value, { req }) => {
    
    if (!req.file) {
      throw new Error('Project image is required');
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
    
  //   const isSlugExist = await ProjectModel.findOne({ slug: newValue });
  //   if (isSlugExist) {
  //     throw new Error('The slug is already in used.');
  //   }

  //   return true;
  // }),
  body('slug').notEmpty().trim().withMessage('The slug field is required.'),
  // body('location').notEmpty().trim().withMessage('The location field is required.'),
  body('products').isArray({ min: 1 }).withMessage('The product field is required.')
  .custom(async value => {
    getProductId = value;

    if (typeof getProductId === 'undefined') {
      throw new Error('The product type field is required.');
    }

    const isProductExist = await ProductModel.findOne({ _id: getProductId });

    if (!isProductExist) {
      throw new Error('The product type is not matched. Please select the correct service type.');
    }

    return true;

  }),
  body('homepage').trim().notEmpty().isBoolean().withMessage('Display on homepage field is required.'),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
];

exports.doAddProject = [
  upload.single('projectImg'), 
  validateProjectImg,
  validation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.title,
      slug: masterHelper.slugify(req.body.slug),
      image: req.file.path,
      description: req.body.description,
      products: req.body.products,
      homepage: req.body.homepage,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    }

    //save the data
    const newProduct = new ProjectModel(data);
    newProduct.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating blog.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Product has been added successfully.'});

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
    
  //   const isSlugExist = await ProjectModel.findOne({ 
  //     slug: newValue,
  //     _id: { $ne: req.body._id },
  //   });

  //   if (isSlugExist) {
  //     throw new Error('The slug is already in used.');
  //   }

  //   return true;
  // }),
  // body('location').notEmpty().trim().withMessage('The location field is required.'),
  body('products').isArray({ min: 1 }).withMessage('The product field is required.')
  .custom(async value => {
    getProductId = value;

    if (typeof getProductId === 'undefined') {
      throw new Error('The product field is required.');
    }

    const isProductExist = await ProductModel.findOne({ _id: getProductId });

    if (!isProductExist) {
      throw new Error('The product is not matched. Please select the correct product.');
    }

    return true;

  }),
  body('homepage').trim().notEmpty().isBoolean().withMessage('Display on homepage field is required.'),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The project id is required.'),  
];

const validateProjectImgWhileUpdate = [
  check('projectImg').custom((value, { req }) => {
    
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

exports.doUpdateProject = [
  uploadUpdateProject.single('projectImg'),
  validateProjectImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const projectId = req.body._id;

    //check if id exist
    ProjectModel.findOne({_id: projectId})
    .then((project) => {

      console.log(req.body);

      if (!project) {
        console.log(project);
        return res.status(400).json({msg: 'Unable to find project', 'eType': 'final'});
      }

      if (req.file) {

        if (project.image) {
          fs.unlink(path.join(__dirname, '../../', project.image), (err) => {
            console.log(err);
          });
        }
        
        project.image = req.file.path;

      }

      project.title = req.body.title;
      project.slug = masterHelper.slugify(req.body.slug);
      project.description = req.body.description;
      project.products = req.body.products;      
      project.homepage = req.body.homepage;
      project.metaTitle = req.body.metaTitle;
      project.metaDescription = req.body.metaDescription;
      return project.save();

    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'Project has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find project data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The project id is required.'),
];

exports.doDeleteProject = [
  validateBefDelete,
  (req, res, next) => {

    const projectId = req.body.id;

    ProjectModel.findOne({_id: projectId}).then((project) => {

      if (!project) {
        return res.status(400).json({msg: 'Unable to find product.', 'eType': 'final'});
      }

      if (project.image) {
        fs.unlink(path.join(__dirname, '../../', project.image), (err) => {
          console.log(err);
        });
      }

      return ProjectModel.findByIdAndDelete(projectId);

    })
    .then((isDel) => {
      
      if (isDel) {
        return res.status(200).json({msg: 'Project has been deleted'});
      } else {
        return res.status(400).json({msg: 'Project not found.', 'eType': 'final'});
      }

    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]