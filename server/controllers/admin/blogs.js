const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const path = require("path")
const BlogModel = require('../../models/blog_model');
const CategoryModel = require('../../models/category_model');
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
    cb(null, 'uploads/blogs/');
  }
});
const upload = multer({ storage: storage });


const updateBlogStorage = multer.diskStorage({
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
    cb(null, 'uploads/blogs/');
  }
});
const uploadUpdateBlog = multer({ storage: updateBlogStorage });


const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.blog = (req, res, next) => {
  BlogModel.find().sort({ _id: -1 })
    .populate('category')
    .populate('user')
    .exec()
    .then((blogData) => {
      res.render("admin/blogs/main", {
        title: masterHelper.siteTitle('Blogs'),
        currentMenu: 'blogs',
        subMenu: '',
        userData: req.session.user,
        blogData: blogData,
      });
    }).catch((err) => {
      console.log(err);
  })
}

exports.addBlog = async (req, res, next) => {
  try {

    const categories = await CategoryModel.find();
    // Add multiple models to fetch data

    let defImg = "../../media/blank.svg";

    const today = new Date();
    const year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();

    // Add leading zero if month/day is a single digit
    if (month < 10) {
        month = '0' + month;
    }
    if (day < 10) {
        day = '0' + day;
    }

    const currentDate = `${year}-${month}-${day}`;

    res.render("admin/blogs/add", {
      title: masterHelper.siteTitle('Add Blogs'),
      currentMenu: 'blogs',
      subMenu: 'add',
      userData: req.session.user,
      blogImg: defImg,
      categories: categories,
      currentDate: currentDate
    });

  } catch(err) {
    console.error('Error retrieving data:', err);
    return res.status(500).send('Internal Server Error');
  }
}

exports.editBlog = async (req, res, next) => {    
    
    try {

      const blogId = req.params.id;
      const categories = await CategoryModel.find();

      BlogModel.findOne({_id: blogId})
      .populate('category')
      .exec()
      .then((result) => {

        if (!result) {
          return res.redirect('/admin/category');
        }

        let defImg = "../../media/blank.svg";
        
        if (result.image) {
          defImg = masterHelper.siteUrl() + result.image;
        }

        const today = new Date();
        const year = today.getFullYear();
        let month = today.getMonth() + 1;
        let day = today.getDate();

        // Add leading zero if month/day is a single digit
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }

        const currentDate = `${year}-${month}-${day}`;

        const publishDate = result.publishDate || result.createdAt;
        const publishDateYear = publishDate.getFullYear();
        let publishDateMonth = publishDate.getMonth() + 1;
        let publishDateDay = publishDate.getDate();
        if (publishDateMonth < 10) {
            publishDateMonth = '0' + publishDateMonth;
        }
        if (publishDateDay < 10) {
            publishDateDay = '0' + publishDateDay;
        }

        const newPublishDate = `${publishDateYear}-${publishDateMonth}-${publishDateDay}`;

        res.render("admin/blogs/edit", {
          title: masterHelper.siteTitle('Edit Blogs'),
          currentMenu: 'blogs',
          subMenu: 'blog-edit',
          userData: req.session.user,
          blogData: result,
          blogImg: defImg,
          categories: categories,
          currentDate: currentDate,
          publishDate: newPublishDate,
        });

      }).catch((err) => {
          console.log(err);
          return res.redirect('/admin/category');
      });

    } catch(err) {
      console.log(err);
      return res.status(500).send('Internal Server Error');
    }
  
}

const validateBlogImg = [
  check('blogImg').custom((value, { req }) => {
    
    if (!req.file) {
      throw new Error('Blog image is required');
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
  body('slug').notEmpty().trim().withMessage('The slug field is required.')
  .custom(async value => {
    newValue = masterHelper.slugify(value);    
    
    const isSlugExist = await BlogModel.findOne({ slug: newValue });
    if (isSlugExist) {
      throw new Error('The slug is already in used.');
    }

    return true;
  }),
  body('category').notEmpty().trim().withMessage('The category field is required.')
  .custom(async value => {
    getCatId = value;
  
    const isCatExist = await CategoryModel.findOne({ _id: getCatId });
    if (!isCatExist) {
      throw new Error('The category is not matched. Please select the correct category.');
    }
    return true;
  }),
  body('shortDescription').optional({ nullable: true, checkFalsy: true }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('credit').optional({ nullable: true, checkFalsy: true }),
  body('publishDate').notEmpty().trim().withMessage('The publish date field is required.'),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
];

exports.doAddBlog = [
  upload.single('blogImg'), 
  validateBlogImg,
  validation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.title,
      slug: masterHelper.slugify(req.body.slug),
      category: req.body.category,
      shortDescription: req.body.shortDescription,
      description: req.body.description,
      image: req.file.path,
      user: req.session.user.userId,
      credit: req.body.credit,
      publishDate: req.body.publishDate,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    }

    //save the data
    const newBlog = new BlogModel(data);
    newBlog.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating blog.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Blog has been created successfully.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

const updateValidation = [
  body('title').notEmpty().trim().withMessage('The title field is required.'),
  body('slug').notEmpty().trim().withMessage('The slug field is required.')
  .custom(async (value, { req }) => {
    newValue = masterHelper.slugify(value);    
    
    const isSlugExist = await BlogModel.findOne({ 
      slug: newValue,
      _id: { $ne: req.body._id },
    });

    if (isSlugExist) {
      throw new Error('The slug is already in used.');
    }

    return true;
  }),
  body('category').notEmpty().trim().withMessage('The category field is required.')
  .custom(async value => {
    getCatId = value;
    const isCatExist = await CategoryModel.findOne({ _id: getCatId });
    if (!isCatExist) {
      throw new Error('The category is not matched. Please select the correct category.');
    }
    return true;
  }),
  body('shortDescription').optional({ nullable: true, checkFalsy: true }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('credit').optional({ nullable: true, checkFalsy: true }),
  body('publishDate').notEmpty().trim().withMessage('The publish date field is required.'),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The blog id is required.'),  
];

const validateBlogImgWhileUpdate = [
  check('blogImg').custom((value, { req }) => {
    
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

exports.doUpdateBlog = [
  uploadUpdateBlog.single('blogImg'),
  validateBlogImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const blogId = req.body._id;

    //check if id exist
    BlogModel.findOne({_id: blogId})
    .then((getBlog) => {

      if (!getBlog) {
        console.log(getBlog);
        return res.status(400).json({msg: 'Unable to find blog data', 'eType': 'final'});
      }

      if (req.file) {

        if (getBlog.image) {
          fs.unlink(path.join(__dirname, '../../', getBlog.image), (err) => {
            console.log(err);
          });
        }
        
        getBlog.image = req.file.path;

      }

      getBlog.title = req.body.title;
      getBlog.slug = masterHelper.slugify(req.body.slug);
      getBlog.category = req.body.category;
      getBlog.shortDescription = req.body.shortDescription;
      getBlog.description = req.body.description;
      getBlog.credit = req.body.credit;
      getBlog.publishDate = req.body.publishDate;
      getBlog.metaTitle = req.body.metaTitle;
      getBlog.metaDescription = req.body.metaDescription;
      return getBlog.save();

    })
    .then((result) => {
        if (!result) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }
        return res.status(200).json({msg: 'Blog has been updated sucessfully.'});
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Unable to find blog data', 'eType': 'final'});
    });
    
  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The blog id is required.'),
];

exports.doDeleteBlog = [
  validateBefDelete,
  (req, res, next) => {

    const blogId = req.body.id;

    BlogModel.findOne({_id: blogId}).then((blog) => {

      if (!blog) {
        return res.status(400).json({msg: 'Unable to find blog.', 'eType': 'final'});
      }

      if (blog.image) {
        fs.unlink(path.join(__dirname, '../../', blog.image), (err) => {
          console.log(err);
        });
      }

      return BlogModel.findByIdAndDelete(blogId);

    })
    .then((isDel) => {
      
      if (isDel) {
        return res.status(200).json({msg: 'Blog has been deleted'});
      } else {
        return res.status(400).json({msg: 'Blog not found.', 'eType': 'final'});
      }    

    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    });

  }
]