const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const CategoryModel = require('../../models/product_category_model');
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
    cb(null, "uploads/product-category/");
  },
});
const upload = multer({ storage: storage });

const updateCategoryStorage = multer.diskStorage({
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
    cb(null, "uploads/product-category/");
  },
});
const uploadUpdateCategory = multer({ storage: updateCategoryStorage });

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.category = (req, res, next) => {
  CategoryModel.find().sort({ _id: -1 }).then((categoryData) => {
    res.render("admin/product-category/main", {
      title: masterHelper.siteTitle('Product Category'),
      currentMenu: 'product-category',
      subMenu: '',
      userData: req.session.user,
      categoryData: categoryData,
    });
  }).catch((err) => {
    console.log(err);
  })
}

exports.addCategory = (req, res, next) => {  
  let defImg = "../../media/blank.svg";
  res.render("admin/product-category/add", {
    title: masterHelper.siteTitle('Add Product Category'),
    currentMenu: 'product-category',
    subMenu: 'product-category-add',
    userData: req.session.user,
    categoryImg: defImg,
  });
}

exports.editCategory = (req, res, next) => {    
  const catId = req.params.id;

  CategoryModel.findOne({_id: catId}).then((result) => {

    if (!result) {
      return res.redirect('/admin/product-category');
    }

    let defImg = "../../media/blank.svg";

    if (result.image) {
      defImg = masterHelper.siteUrl() + result.image;
    }

    res.render("admin/product-category/edit", {
      title: masterHelper.siteTitle('Edit Product Category'),
      currentMenu: 'product-category',
      subMenu: 'product-category-edit',
      userData: req.session.user,
      categoryData: result,
      categoryImg: defImg,
    });

  }).catch((err) => {
      console.log(err);
      return res.redirect('/admin/product-category');
  });
}

const validateCatImg = [
  check("categoryImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Category image is required");
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
  body('categoryName').notEmpty().trim().withMessage('The product category name field is required.'),
  body('categorySlug').notEmpty().trim().withMessage('The product category slug field is required.')
  .custom(async value => {
    newValue = masterHelper.slugify(value);    
    
    const isSlugExist = await CategoryModel.findOne({ slug: newValue });
    if (isSlugExist) {
      throw new Error('The product category slug is already in used.');
    }

    return true;
  }),
  body('description').notEmpty().trim().withMessage('The description field is required.'),
  body('_csrf').custom(isCsrfValid),
];

exports.doAddCategory = [
  upload.single("categoryImg"),
  validateCatImg,
  validation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.categoryName,
      slug: masterHelper.slugify(req.body.categorySlug),
      image: req.file.path,
      description: req.body.description,
    }

    //save the data
    const newCategory = new CategoryModel(data);
    newCategory.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating category.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Product category has been created successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('categoryName').notEmpty().trim().withMessage('The product category name field is required.'),
  body('categorySlug').notEmpty().trim().withMessage('The product category slug field is required.')
  .custom(async (value, { req }) => {
    newValue = masterHelper.slugify(value);
    const isSlugExist = await CategoryModel.findOne({ 
      slug: newValue,
      _id: { $ne: req.body._id },
    });
    if (isSlugExist) {
      throw new Error('The product category slug is already in used.');
    }

    return true;
  }),
  body('description').notEmpty().trim().withMessage('The description slug field is required.'),
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The category id is required.'),
];

const validateCatImgWhileUpdate = [
  check("categoryImg").custom((value, { req }) => {
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

exports.doUpdateCategory = [
  uploadUpdateCategory.single("categoryImg"),
  validateCatImgWhileUpdate,
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

      if (req.file) {
        if (getCategory.image) {
          fs.unlink(
            path.join(__dirname, "../../", getCategory.image),
            (err) => {
              console.log(err);
            }
          );
        }

        getCategory.image = req.file.path;
      }

      getCategory.title = req.body.categoryName;
      getCategory.slug = masterHelper.slugify(req.body.categorySlug);
      getCategory.description = req.body.description;
      return getCategory.save();
    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }

        return res.status(200).json({msg: 'Product category has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find product category data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The product category id is required.'),
];

exports.doDeleteCategory = [
  validateBefDelete,
  (req, res, next) => {

    const catId = req.body.id;

    CategoryModel.findByIdAndDelete(catId)
    .then((deleteCat) => {
      
      if (deleteCat) {

        if (deleteCat.image) {
          fs.unlink(path.join(__dirname, "../../", deleteCat.image), (err) => {
            console.log(err);
          });
        }

        return res.status(200).json({msg: 'Product category has been deleted'});
      } else {
        return res.status(400).json({msg: 'Product category not found.', 'eType': 'final'});
      }      

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]