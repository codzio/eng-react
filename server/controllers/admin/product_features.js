const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ProductFeaturesModel = require("../../models/product_features_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");

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
    cb(null, "uploads/product-features/");
  },
});
const upload = multer({ storage: storage });

const updateEventStorage = multer.diskStorage({
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
    cb(null, "uploads/product-features/");
  },
});
const uploadUpdateEvent = multer({ storage: updateEventStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.productFeatures = (req, res, next) => {
  ProductFeaturesModel.find()
    .sort({ _id: -1 })
    .then((prodFeatureData) => {
      res.render("admin/product-features/main", {
        title: masterHelper.siteTitle("Event"),
        currentMenu: "product-features",
        subMenu: "",
        userData: req.session.user,
        prodFeatureData: prodFeatureData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addProductFeatures = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/product-features/add", {
    title: masterHelper.siteTitle("Add Product Feature"),
    currentMenu: "product-features",
    subMenu: "product-feature-add",
    userData: req.session.user,
    productFeatureImg: defImg,
  });
};

exports.editProductFeatures = (req, res, next) => {
  const productFeatureId = req.params.id;

  ProductFeaturesModel.findOne({ _id: productFeatureId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/product-features");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/product-features/edit", {
        title: masterHelper.siteTitle("Edit Product Feature"),
        currentMenu: "product-features",
        subMenu: "product-features-edit",
        userData: req.session.user,
        prodFeatureData: result,
        productFeatureImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/product-features");
    });
};

const validateProdFeatureImg = [
  check("productFeatureImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Product Feature image is required");
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
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddProductFeatures = [
  upload.single("productFeatureImg"),
  validateProdFeatureImg,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      title: req.body.title,      
      image: req.file.path,
    };

    //save the data
    const newProdFeature = new ProductFeaturesModel(data);
    newProdFeature
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res.status(400).json({
            msg: "Something went wrong while creating blog.",
            eType: "final",
          });
        }

        return res
          .status(200)
          .json({ msg: "Product Feature has been created successfully." });
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
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The event id is required."),
];

const validateProdFeatureImgWhileUpdate = [
  check("productFeatureImg").custom((value, { req }) => {
    // if (!req.file) {
    //   throw new Error('Banner image is required');
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

exports.doUpdateProductFeatures = [
  uploadUpdateEvent.single("productFeatureImg"),
  validateProdFeatureImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const productFeatureId = req.body._id;

    //check if id exist
    ProductFeaturesModel.findOne({ _id: productFeatureId })
      .then((getProdFeature) => {
        if (!getProdFeature) {
          console.log(getProdFeature);
          return res
            .status(400)
            .json({ msg: "Unable to find product feature data", eType: "final" });
        }

        if (req.file) {
          if (getProdFeature.image) {
            fs.unlink(path.join(__dirname, "../../", getProdFeature.image), (err) => {
              console.log(err);
            });
          }

          getProdFeature.image = req.file.path;
        }

        getProdFeature.title = req.body.title;
        getProdFeature.description = req.body.description;
        return getProdFeature.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Product feature has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find product feature data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The product feature id is required."),
];

exports.doDeleteProductFeatures = [
  validateBefDelete,
  (req, res, next) => {
    const productFeatureId = req.body.id;

    ProductFeaturesModel.findOne({ _id: productFeatureId })
      .then((event) => {
        if (!event) {
          return res
            .status(400)
            .json({ msg: "Unable to find product feature.", eType: "final" });
        }

        if (event.image) {
          fs.unlink(path.join(__dirname, "../../", event.image), (err) => {
            console.log(err);
          });
        }

        return ProductFeaturesModel.findByIdAndDelete(productFeatureId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Product feature has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Product feature not found.", eType: "final" });
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
