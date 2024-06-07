const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path")
const PageModel = require('../../models/page_model');
const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');


const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.page = (req, res, next) => {
  PageModel.find().sort({ _id: -1 })
  .then((pageData) => {
      res.render("admin/page/main", {
        title: masterHelper.siteTitle('Page'),
        currentMenu: 'page',
        subMenu: '',
        userData: req.session.user,
        pageData: pageData,
      });
    }).catch((err) => {
      console.log(err);
  })
}

exports.addPage = (req, res, next) => {
  
  let defImg = "../../media/blank.svg";
  
  res.render("admin/page/add", {
    title: masterHelper.siteTitle('Add Page'),
    currentMenu: 'page',
    subMenu: 'page-add',
    userData: req.session.user,
    pdf: defImg,
  });

}

exports.editPage = (req, res, next) => {  

    const pageId = req.params.id;

    PageModel
      .findById({_id: pageId})
      .then((result) => {

        if (!result) {
          return res.redirect('/admin/page');
        }

        let defImg = "../../media/blank.svg";

        res.render("admin/page/edit", {
          title: masterHelper.siteTitle('Edit Page'),
          currentMenu: 'page',
          subMenu: 'page-edit',
          userData: req.session.user,
          pageData: result, 
        });

      }).catch((err) => {
          console.log(err, 'errro');
          return res.redirect('/admin/page');
      });
  
}

const validation = [
  body('title').notEmpty().trim().withMessage('The title field is required.'),
  body('slug').notEmpty().trim().withMessage('The slug field is required.')
  .custom(async value => {
    newValue = masterHelper.slugify(value);    
    
    const isSlugExist = await PageModel.findOne({ slug: newValue });
    if (isSlugExist) {
      throw new Error('The slug is already in used.');
    }

    return true;
  }),
  body('heading1').optional({ nullable: true, checkFalsy: true }),
  body('heading2').optional({ nullable: true, checkFalsy: true }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('data').optional({ nullable: true, checkFalsy: true }), 
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
];

exports.doAddPage = [
  validation,
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      title: req.body.title,
      slug: masterHelper.slugify(req.body.slug),
      heading1: req.body.heading1,
      heading2: req.body.heading2,
      description: req.body.description,
      data: null,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
    }

    //save the data
    const newPage = new PageModel(data);
    newPage.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong while creating page.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Page has been added successfully.'});

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
    
    const isSlugExist = await PageModel.findOne({ 
      slug: newValue,
      _id: { $ne: req.body._id },
    });

    if (isSlugExist) {
      throw new Error('The slug is already in used.');
    }

    return true;
  }),
  body('heading1').optional({ nullable: true, checkFalsy: true }),
  body('heading2').optional({ nullable: true, checkFalsy: true }),
  body('description').optional({ nullable: true, checkFalsy: true }),
  body('data').optional({ nullable: true, checkFalsy: true }),
  body('metaTitle').optional({ nullable: true, checkFalsy: true }),
  body('metaDescription').optional({ nullable: true, checkFalsy: true }), 
  body('_csrf').custom(isCsrfValid),
  body('_id').notEmpty().trim().withMessage('The page id is required.'),  
];

exports.doUpdatePage = [
  updateValidation,
  async (req, res, next) => {

    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
      }

      const pageId = req.body._id;
      const getPage = await PageModel.findOne({_id: pageId});    

      if (!getPage) {
        return res.status(400).json({msg: 'Unable to find page data', 'eType': 'final'});
      }

      let data = [];

      //about page
      if (pageId == "64ec49e4e0caf56a64815819") {
          data.push({
            ourJourney: req.body.ourJourney,
            howWeWork: req.body.howWeWork,
            mission: req.body.mission,
            vision: req.body.vision,
          });
      }

      getPage.title = req.body.title;
      getPage.slug = masterHelper.slugify(req.body.slug);
      getPage.heading1 = req.body.heading1;
      getPage.heading2 = req.body.heading2;
      getPage.description = req.body.description;
      getPage.data = data;
      getPage.metaTitle = req.body.metaTitle;
      getPage.metaDescription = req.body.metaDescription;
      updatePage = await getPage.save();  

      if (!updatePage) {
          return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
      }

      return res.status(200).json({msg: 'Page has been updated sucessfully.'});

    } catch (error) {
      console.log(error);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    }

  }
];

const validateBefDelete = [
  body('_csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The product id is required.'),
];

exports.doDeleteProduct = [
  validateBefDelete,
  async (req, res, next) => {

    try {

      const productId = req.body.id;
      const getProduct = await ProductModel.findOne({_id: productId});
      
      if (!getProduct) {
        return res.status(400).json({msg: 'Unable to find product data', 'eType': 'final'});
      }

      //check featured img
      if (getProduct.featuredImg) {
        const removeFeaturedImg = await fsPromisse.unlink(path.join(__dirname, '../../', getProduct.featuredImg));
      }

      //check pdf
      if (getProduct.pdf) {
        const removePdf = await fsPromisse.unlink(path.join(__dirname, '../../', getProduct.pdf));
      }

      //remove additional image
      if (getProduct.addImages) {
        getProduct.addImages.forEach(async (addImg) => {
           await fsPromisse.unlink(path.join(__dirname, '../../', addImg));
        })
      }

      const isDel = await ProductModel.findByIdAndDelete(productId);

      if (isDel) {
        return res.status(200).json({msg: 'Product has been deleted'});
      }

      return res.status(400).json({msg: 'Product not found.', 'eType': 'final'});

    } catch(err) {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    }

  }
]

const validateBefDeleteAddImg = [
  body('csrf').custom(isCsrfValid),
  body('id').notEmpty().trim().withMessage('The product id is required.'),
  body('attachmentUrl').notEmpty().trim().withMessage('The attachment url is required.'),
];