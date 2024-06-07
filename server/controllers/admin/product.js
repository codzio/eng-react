const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path");
const ProductModel = require("../../models/product_model");
const CategoryModel = require("../../models/product_category_model");
const SubcategoryModel = require("../../models/product_subcategory_model");
const FeatureModel = require("../../models/product_features_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const { category } = require("./category");

// Set up Multer storage and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = "uploads/products/featured-image/";

    if (file.fieldname == "addImages") {
      destination = "uploads/products/additional-images/";
    } else if (file.fieldname == "productPdf") {
      destination = "uploads/products/pdf/";
    }

    cb(null, destination);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      masterHelper.slugify(path.parse(file.originalname).name) +
        "-" +
        Date.now() +
        path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only image and PDF files are allowed"), false);
  }
};

const maxSize = 1 * 1024 * 1024; // 10MB maximum file size

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxSize, // Set maximum file size
  },
});

const updateProductStorage = multer.diskStorage({
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
    cb(null, "uploads/use-cases/");
  },
});
const uploadUpdateProduct = multer({ storage: updateProductStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.product = (req, res, next) => {
  ProductModel.find()
    .sort({ _id: -1 })
    .populate("prodCategory")
    .exec()
    .then((productData) => {
      res.render("admin/product/main", {
        title: masterHelper.siteTitle("Product"),
        currentMenu: "product",
        subMenu: "",
        userData: req.session.user,
        productData: productData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addProduct = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    const features = await FeatureModel.find();
    const products = await ProductModel.find({ product: null });

    let defImg = "../../media/blank.svg";

    res.render("admin/product/add", {
      title: masterHelper.siteTitle("Add Product"),
      currentMenu: "product",
      subMenu: "product-add",
      userData: req.session.user,
      pdf: defImg,
      categories: categories,
      features: features,
      products: products,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.editProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const getProduct = await ProductModel.findById({ _id: productId })
      .populate("prodCategory")
      .populate("prodSubCategory")
      .populate("prodFeatures")
      .exec();

    if (!getProduct) {
      return res.redirect("/admin/product");
    }

    const categories = await CategoryModel.find();
    const products = await ProductModel.find({ product: null });
    // const subCategories = await SubcategoryModel.find({
    //   prodCategory: getProduct.prodCategory._id,
    // });
    const features = await FeatureModel.find();

    let defImg = "../../media/blank.svg";

    if (getProduct.image) {
      defImg = masterHelper.siteUrl() + getProduct.image;
    }

    let myProduct = await res.render("admin/product/edit", {
      title: masterHelper.siteTitle("Edit Product"),
      currentMenu: "product",
      subMenu: "product-edit",
      userData: req.session.user,
      productData: getProduct,
      pdf: defImg,
      categories: categories,
      // subCategories: subCategories,
      features: features,
      products: products,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const validateFeaturedImg = [
  check("featuredImg").custom((value, { req }) => {
    if (!req.body._id) {
      if (!req.files.featuredImg) {
        throw new Error("Featured image is required");
      }
    }

    if (req.files.featuredImg) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.files.featuredImg[0].mimetype)) {
        throw new Error(
          "Invalid file type. Please upload a PNG, JPEG, or JPG image"
        );
      }

      // Check file size (max 500 KB)
      const maxSize = 2 * 1024 * 1024; // 500 KB in bytes
      if (req.files.featuredImg[0].size > maxSize) {
        throw new Error("File size exceeds the limit of 2 MB");
      }
    }

    return true;
  }),
];

const validatePdf = [
  check("productPdf").custom((value, { req }) => {
    // if (!req.file) {
    //   throw new Error('PDF is required');
    // }

    if (req.files.productPdf) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(req.files.productPdf[0].mimetype)) {
        throw new Error("Invalid file type. Please upload a PDF");
      }

      // Check file size (max 500 KB)
      const maxSize = 2 * 1024 * 1024; // 500 KB in bytes
      if (req.files.productPdf[0].size > maxSize) {
        throw new Error("File size exceeds the limit of 2 MB");
      }
    }

    return true;
  }),
];

const validateAddImg = [
  check("featuredImg").custom((value, { req }) => {
    // if (!req.file) {
    //   throw new Error('Featured image is required');
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
      const maxSize = 2 * 1024 * 1024; // 500 KB in bytes
      if (req.file.size > maxSize) {
        throw new Error("File size exceeds the limit of 2 MB");
      }
    }

    return true;
  }),
];

const validation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("slug")
    .notEmpty()
    .trim()
    .withMessage("The slug field is required.")
    .custom(async (value) => {
      newValue = masterHelper.slugify(value);

      const isSlugExist = await ProductModel.findOne({ slug: newValue });
      if (isSlugExist) {
        throw new Error("The slug is already in used.");
      }

      return true;
    }),
  body("category")
    .notEmpty()
    .trim()
    .withMessage("The category field is required.")
    .custom(async (value) => {
      getCatId = value;

      if (getCatId) {
        const isCatExist = await CategoryModel.findOne({ _id: getCatId });
        if (!isCatExist) {
          throw new Error(
            "The category is not matched. Please select the correct category."
          );
        }
        return true;
      }
    }),
  body("product")
    .optional({ nullable: true, checkFalsy: true })
    .custom(async (value) => {
      getProductId = value;

      if (getProductId) {
        const isProductExist = await ProductModel.findOne({
          _id: getProductId,
        });
        if (!isProductExist) {
          throw new Error(
            "The product is not matched. Please select the correct product."
          );
        }
        return true;
      }
    }),
  // body("subCategory")
  //   .notEmpty()
  //   .trim()
  //   .withMessage("The sub category field is required.")
  //   .custom(async (value, { req }) => {
  //     categoryId = req.body.category;
  //     subCategoryId = value;

  //     const isSubCatExist = await SubcategoryModel.findOne({
  //       _id: subCategoryId,
  //       prodCategory: categoryId,
  //     });
  //     if (!isSubCatExist) {
  //       throw new Error(
  //         "The sub category is not matched. Please select the correct sub category."
  //       );
  //     }
  //     return true;
  //   }),
  body("productFeatures")
    .optional({ nullable: true, checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage("The product feature field is required.")
    .custom(async (value) => {
      getProdFeatureId = value;

      if (typeof getProdFeatureId === "undefined") {
        throw new Error("The product feature field is required.");
      }

      const isFeatureExist = await FeatureModel.findOne({
        _id: getProdFeatureId,
      });

      if (!isFeatureExist) {
        throw new Error(
          "The product feature is not matched. Please select the correct feature."
        );
      }

      return true;
    }),
  body("homepage")
    .trim()
    .notEmpty()
    .isBoolean()
    .withMessage("Display on homepage field is required."),
  body("description")
    .notEmpty()
    .trim()
    .withMessage("The description field is required."),
  body("features").optional({ nullable: true, checkFalsy: true }),
  body("disableLinking").optional({ nullable: true, checkFalsy: true }),
  body("techSpecification").optional({ nullable: true, checkFalsy: true }),
  body("video")
    .optional({ nullable: true, checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage("The product video field is required."),
  body("metaTitle").optional({ nullable: true, checkFalsy: true }),
  body("metaDescription").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddProduct = [
  upload.fields([
    { name: "featuredImg", maxCount: 1 },
    { name: "productPdf" },
    { name: "addImages", maxCount: 5 },
  ]),
  validateFeaturedImg,
  validateAddImg,
  validatePdf,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    let pdfPath = null;

    if (req.files["productPdf"]) {
      pdfPath = req.files["productPdf"][0].path;
    }

    const additionalImg = req.files["addImages"];
    const getAdditionImg = [];

    if (additionalImg) {
      additionalImg.forEach((addImg) => {
        console.log(addImg.path);
        getAdditionImg.push(addImg.path);
      });
    }

    const data = {
      title: req.body.title,
      slug: masterHelper.slugify(req.body.slug),
      prodCategory: req.body.category,
      product: req.body.product || null,
      // prodSubCategory: req.body.subCategory,
      prodFeatures: req.body.productFeatures,
      description: req.body.description,
      features: req.body.features,
      techSpec: req.body.techSpecification,
      featuredImg: req.files["featuredImg"][0].path,
      pdf: pdfPath,
      homepage: req.body.homepage,
      addImages: getAdditionImg,
      metaTitle: req.body.metaTitle,
      metaDescription: req.body.metaDescription,
      disableLinking: req.body.disableLinking || false,
      videos: req.body.video,
    };

    //save the data
    const newProduct = new ProductModel(data);
    newProduct
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res.status(400).json({
            msg: "Something went wrong while creating product.",
            eType: "final",
          });
        }

        return res
          .status(200)
          .json({ msg: "Product has been added successfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      });
  },
];

const updateValidation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("slug")
    .notEmpty()
    .trim()
    .withMessage("The slug field is required.")
    .custom(async (value, { req }) => {
      newValue = masterHelper.slugify(value);

      const isSlugExist = await ProductModel.findOne({
        slug: newValue,
        _id: { $ne: req.body._id },
      });

      if (isSlugExist) {
        throw new Error("The slug is already in used.");
      }

      return true;
    }),
  body("category")
    .notEmpty()
    .trim()
    .withMessage("The category field is required.")
    .custom(async (value) => {
      getCatId = value;

      const isCatExist = await CategoryModel.findOne({ _id: getCatId });
      if (!isCatExist) {
        throw new Error(
          "The category is not matched. Please select the correct category."
        );
      }
      return true;
    }),
  body("product")
    .optional({ nullable: true, checkFalsy: true })
    .custom(async (value) => {
      getProductId = value;

      if (getProductId) {
        const isProductExist = await ProductModel.findOne({
          _id: getProductId,
        });
        if (!isProductExist) {
          throw new Error(
            "The product is not matched. Please select the correct product."
          );
        }
        return true;
      }
    }),
  // body("subCategory")
  //   .notEmpty()
  //   .trim()
  //   .withMessage("The sub category field is required.")
  //   .custom(async (value, { req }) => {
  //     categoryId = req.body.category;
  //     subCategoryId = value;

  //     const isSubCatExist = await SubcategoryModel.findOne({
  //       _id: subCategoryId,
  //       prodCategory: categoryId,
  //     });
  //     if (!isSubCatExist) {
  //       throw new Error(
  //         "The sub category is not matched. Please select the correct sub category."
  //       );
  //     }
  //     return true;
  //   }),
  body("productFeatures")
    .optional({ nullable: true, checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage("The product feature field is required.")
    .custom(async (value) => {
      getProdFeatureId = value;

      if (typeof getProdFeatureId === "undefined") {
        throw new Error("The product feature field is required.");
      }

      const isFeatureExist = await FeatureModel.findOne({
        _id: getProdFeatureId,
      });

      if (!isFeatureExist) {
        throw new Error(
          "The product feature is not matched. Please select the correct feature."
        );
      }

      return true;
    }),
  body("video")
    .optional({ nullable: true, checkFalsy: true })
    .isArray({ min: 1 })
    .withMessage("The product video field is required."),
  body("homepage")
    .trim()
    .notEmpty()
    .isBoolean()
    .withMessage("Display on homepage field is required."),
  body("description")
    .notEmpty()
    .trim()
    .withMessage("The description field is required."),
  body("disableLinking").optional({ nullable: true, checkFalsy: true }),
  body("features").optional({ nullable: true, checkFalsy: true }),
  body("techSpecification").optional({ nullable: true, checkFalsy: true }),
  body("metaTitle").optional({ nullable: true, checkFalsy: true }),
  body("metaDescription").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doUpdateProduct = [
  upload.fields([
    { name: "featuredImg", maxCount: 1 },
    { name: "productPdf" },
    { name: "addImages", maxCount: 5 },
  ]),
  validateFeaturedImg,
  validateAddImg,
  validatePdf,
  updateValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const productId = req.body._id;
      const getProduct = await ProductModel.findOne({ _id: productId });

      if (!getProduct) {
        return res
          .status(400)
          .json({ msg: "Unable to find product data", eType: "final" });
      }

      let featuredImg = getProduct.featuredImg;

      if (req.files["featuredImg"]) {
        const featuredImgPath = path.join(
          __dirname,
          "../../",
          getProduct.featuredImg
        );

        if (fs.existsSync(featuredImgPath)) {
          await fsPromisse.unlink(featuredImgPath);
        }

        featuredImg = req.files["featuredImg"][0].path;
      }

      let pdfPath = getProduct.pdf;

      if (req.files["productPdf"]) {
        //remove old pdf if exist

        if (pdfPath != null) {
          const currentPdfPath = path.join(__dirname, "../../", pdfPath);
          if (fs.existsSync(currentPdfPath)) {
            await fsPromisse.unlink(currentPdfPath);
          }
        }

        // if (getProduct.pdf) {
        //   const removePdf = await fsPromisse.unlink(
        //     path.join(__dirname, "../../", getProduct.pdf)
        //   );
        // }

        pdfPath = req.files["productPdf"][0].path;
      }

      const additionalImg = req.files["addImages"];
      const getAdditionImg = getProduct.addImages;

      if (additionalImg) {
        additionalImg.forEach((addImg) => {
          getAdditionImg.push(addImg.path);
        });
      }

      getProduct.title = req.body.title;
      getProduct.slug = masterHelper.slugify(req.body.slug);
      getProduct.prodCategory = req.body.category;
      getProduct.product = req.body.product || null;
      // getProduct.prodSubCategory = req.body.subCategory;
      getProduct.prodFeatures = req.body.productFeatures;
      getProduct.description = req.body.description;
      getProduct.features = req.body.features;
      getProduct.techSpec = req.body.techSpecification;
      getProduct.featuredImg = featuredImg;
      getProduct.pdf = pdfPath;
      getProduct.addImages = getAdditionImg;
      getProduct.homepage = req.body.homepage;
      getProduct.metaTitle = req.body.metaTitle;
      getProduct.metaDescription = req.body.metaDescription;
      getProduct.disableLinking = req.body.disableLinking || false;
      getProduct.videos = req.body.video;

      updateProduct = await getProduct.save();

      if (!updateProduct) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Product has been updated sucessfully." });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doDeleteProduct = [
  validateBefDelete,
  async (req, res, next) => {
    try {
      const productId = req.body.id;
      const getProduct = await ProductModel.findOne({ _id: productId });

      if (!getProduct) {
        return res
          .status(400)
          .json({ msg: "Unable to find product data", eType: "final" });
      }

      //check featured img
      if (getProduct.featuredImg) {
        // const removeFeaturedImg = await fsPromisse.unlink(
        //   path.join(__dirname, "../../", getProduct.featuredImg)
        // );
        if (
          fs.existsSync(path.join(__dirname, "../../", getProduct.featuredImg))
        ) {
          await fsPromisse.unlink(
            path.join(__dirname, "../../", getProduct.featuredImg)
          );
        }
      }

      //check pdf
      if (getProduct.pdf) {
        // const removePdf = await fsPromisse.unlink(
        //   path.join(__dirname, "../../", getProduct.pdf)
        // );
        if (fs.existsSync(path.join(__dirname, "../../", getProduct.pdf))) {
          await fsPromisse.unlink(
            path.join(__dirname, "../../", getProduct.pdf)
          );
        }
      }

      //remove additional image
      if (getProduct.addImages) {
        getProduct.addImages.forEach(async (addImg) => {
          //await fsPromisse.unlink(path.join(__dirname, "../../", addImg));

          if (fs.existsSync(path.join(__dirname, "../../", addImg))) {
            await fsPromisse.unlink(path.join(__dirname, "../../", addImg));
          }
        });
      }

      const isDel = await ProductModel.findByIdAndDelete(productId);

      if (isDel) {
        return res.status(200).json({ msg: "Product has been deleted" });
      }

      return res
        .status(400)
        .json({ msg: "Product not found.", eType: "final" });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];

const validateBefDeleteAddImg = [
  body("csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The product id is required."),
  body("attachmentUrl")
    .notEmpty()
    .trim()
    .withMessage("The attachment url is required."),
];

exports.doDeleteAddImg = [
  validateBefDeleteAddImg,
  async (req, res, next) => {
    try {
      const productId = req.body.id;
      const attachmentUrl = req.body.attachmentUrl;
      const getProduct = await ProductModel.findOne({ _id: productId });

      if (!getProduct) {
        return res
          .status(400)
          .json({ msg: "Unable to find product.", eType: "final" });
      }

      const extractAddImg = getProduct.addImages;
      const newAddImgObj = [];

      extractAddImg.forEach((getImg) => {
        if (getImg != attachmentUrl) {
          newAddImgObj.push(getImg);
        }
      });

      if (fs.existsSync(path.join(__dirname, "../../", attachmentUrl))) {
        const isDeleted = await fsPromisse.unlink(
          path.join(__dirname, "../../", attachmentUrl)
        );
      } else {
        const isDeleted = true;
      }

      // const isDeleted = await fsPromisse.unlink(
      //   path.join(__dirname, "../../", attachmentUrl)
      // );

      if (typeof isDeleted != "undefined") {
        return res.status(400).json({
          msg: "Something went wrong while deleting.",
          eType: "final",
        });
      }

      getProduct.addImages = newAddImgObj;
      updateProduct = await getProduct.save();

      if (!updateProduct) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Image has been removed sucessfully." });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];

exports.doDeletePdf = [
  validateBefDeleteAddImg,
  async (req, res, next) => {
    try {
      const productId = req.body.id;
      const attachmentUrl = req.body.attachmentUrl;
      const getProduct = await ProductModel.findOne({ _id: productId });

      if (!getProduct) {
        return res
          .status(400)
          .json({ msg: "Unable to find product.", eType: "final" });
      }

      const isDeleted = await fsPromisse.unlink(
        path.join(__dirname, "../../", attachmentUrl)
      );

      if (typeof isDeleted != "undefined") {
        return res.status(400).json({
          msg: "Something went wrong while deleting.",
          eType: "final",
        });
      }

      getProduct.pdf = null;
      updateProduct = await getProduct.save();

      if (!updateProduct) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Product PDF has been removed sucessfully." });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];

exports.getSubCategory = [
  async (req, res, next) => {
    try {
      const categoryId = req.body.categoryId;
      const getSubCategory = await SubcategoryModel.find({
        prodCategory: categoryId,
      });

      // let options = '<option value="">Select Sub Category</option>';

      // getSubCategory.forEach((subCat) => {
      //   options += `<option value="${subCat._id}">${subCat.title}</option>`;
      // });
      return res.status(200).json({ subcategory: getSubCategory });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];
