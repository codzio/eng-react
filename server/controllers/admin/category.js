const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const CategoryModel = require('../../models/category_model');
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

exports.category = (req, res, next) => {
  CategoryModel.find().sort({ _id: -1 }).then((categoryData) => {
    res.render("admin/category/main", {
      title: masterHelper.siteTitle('Category'),
      currentMenu: 'category',
      subMenu: '',
      userData: req.session.user,
      categoryData: categoryData,
    });
  }).catch((err) => {
    console.log(err);
  })
}

exports.addCategory = (req, res, next) => {  
  res.render("admin/category/add", {
    title: masterHelper.siteTitle('Add Category'),
    currentMenu: 'category',
    subMenu: 'add',
    userData: req.session.user,
  });
}

exports.editCategory = (req, res, next) => {    
  const catId = req.params.id;

  CategoryModel.findOne({_id: catId}).then((result) => {

    if (!result) {
      return res.redirect('/admin/category');
    }

    res.render("admin/category/edit", {
      title: masterHelper.siteTitle('Edit Category'),
      currentMenu: 'category',
      subMenu: 'category-edit',
      userData: req.session.user,
      categoryData: result
    });

  }).catch((err) => {
      console.log(err);
      return res.redirect('/admin/category');
  });
}

const validation = [
  body('categoryName').notEmpty().trim().withMessage('The category name field is required.'),
  body('categorySlug').notEmpty().trim().withMessage('The category slug field is required.')
  .custom(async value => {
    newValue = masterHelper.slugify(value);    
    
    const isSlugExist = await CategoryModel.findOne({ slug: newValue });
    if (isSlugExist) {
      throw new Error('The category slug is already in used.');
    }

    return true;
  }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
];

exports.doAddCategory = [  
  validation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.categoryName,
      slug: masterHelper.slugify(req.body.categorySlug),
      description: req.body.description,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    }

    //save the data
    const newCategory = new CategoryModel(data);
    newCategory.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating category.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Category has been created successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('categoryName').notEmpty().trim().withMessage('The category name field is required.'),
  body('categorySlug').notEmpty().trim().withMessage('The category slug field is required.')
  .custom(async (value, { req }) => {
    newValue = masterHelper.slugify(value);
    const isSlugExist = await CategoryModel.findOne({ 
      slug: newValue,
      _id: { $ne: req.body._id },
    });
    if (isSlugExist) {
      throw new Error('The category slug is already in used.');
    }

    return true;
  }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The category id is required.'),
];

exports.doUpdateCategory = [  
  updateValidation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const catId = req.body._id;    

    //check if id exist
    CategoryModel.findOne({_id: catId})
    .then((getCategory) => {

      if (!getCategory) {
        console.log(getCategory);
        return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
      }

      getCategory.title = req.body.categoryName;
      getCategory.slug = masterHelper.slugify(req.body.categorySlug);
      getCategory.description = req.body.description;
      getCategory.metaTitle = req.body.metaTitle;
      getCategory.metaDescription = req.body.metaDescription;
      return getCategory.save();
    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }

        return res.status(200).json({msg: 'Category has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find category data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The category id is required.'),
];

exports.doDeleteCategory = [
  validateBefDelete,
  (req, res, next) => {

    const catId = req.body.id;

    CategoryModel.findByIdAndDelete(catId)
    .then((deleteCat) => {
      
      if (deleteCat) {
        return res.status(200).json({msg: 'Category has been deleted'});
      } else {
        return res.status(400).json({msg: 'Category not found.', 'eType': 'final'});
      }      

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]