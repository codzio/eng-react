const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path");
const ProductModel = require("../../models/product_model");
const ProductVariantsModel = require("../../models/product_variants_model");
const CategoryModel = require("../../models/product_category_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const { category } = require("./category");

// Set up Multer storage and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = "uploads/products/featured-image/";

    if (file.fieldname == "productPdf") {
      destination = "uploads/products-variants/pdf/";
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

exports.productVariants = (req, res, next) => {
  ProductVariantsModel.find()
    .sort({ _id: -1 })
    .populate("productId")
    .exec()
    .then((productVariantsData) => {
      res.render("admin/product-variants/main", {
        title: masterHelper.siteTitle("Product Variants"),
        currentMenu: "product-variants",
        subMenu: "",
        userData: req.session.user,
        productVariantsData: productVariantsData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addProductVariant = async (req, res, next) => {
  try {
    const products = await ProductModel.find();

    let defImg = "../../media/blank.svg";

    res.render("admin/product-variants/add", {
      title: masterHelper.siteTitle("Add Product Variants"),
      currentMenu: "product-variants",
      subMenu: "product-variants-add",
      userData: req.session.user,
      pdf: defImg,
      products: products,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.editProductVariant = async (req, res, next) => {
  try {
    const variantId = req.params.id;
    const getProductVariant = await ProductVariantsModel.findById({
      _id: variantId,
    })
      .populate("productId")
      .exec();

    if (!getProductVariant) {
      return res.redirect("/admin/product-variants");
    }

    const products = await ProductModel.find();
    let defImg = "../../media/blank.svg";

    let myProductVariant = await res.render("admin/product-variants/edit", {
      title: masterHelper.siteTitle("Edit Product Variants"),
      currentMenu: "product",
      subMenu: "product-variants-edit",
      userData: req.session.user,
      variantData: getProductVariant,
      products: products,
      pdf: defImg,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const validatePdf = [
  check("productPdf").custom((value, { req }) => {
    if (!req.files.productPdf) {
      throw new Error("The PDF is required");
    }

    if (req.files.productPdf) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(req.files.productPdf[0].mimetype)) {
        throw new Error("Invalid file type. Please upload a PDF");
      }

      // Check file size (max 500 KB)
      const maxSize = 500 * 1024; // 500 KB in bytes
      if (req.files.productPdf[0].size > maxSize) {
        throw new Error("File size exceeds the limit of 500 KB");
      }
    }
    return true;
  }),
];

const updateValidatePdf = [
  check("productPdf").custom(async (value, { req }) => {
    productVariantId = req.body._id;

    const getProductVariant = await ProductVariantsModel.findOne({
      _id: productVariantId,
    });

    if (!getProductVariant.pdf) {
      if (!req.files.productPdf) {
        throw new Error("The PDF is required");
      }

      if (req.files.productPdf) {
        // Check file type (accept png, jpeg, jpg)
        const allowedTypes = ["application/pdf"];
        if (!allowedTypes.includes(req.files.productPdf[0].mimetype)) {
          throw new Error("Invalid file type. Please upload a PDF");
        }

        // Check file size (max 500 KB)
        const maxSize = 500 * 1024; // 500 KB in bytes
        if (req.files.productPdf[0].size > maxSize) {
          throw new Error("File size exceeds the limit of 500 KB");
        }
      }
    }
    return true;
  }),
];

const validation = [
  body("product")
    .notEmpty()
    .trim()
    .withMessage("The product field is required.")
    .custom(async (value) => {
      getProductId = value;

      const isProductExist = await ProductModel.findOne({ _id: getProductId });
      if (!isProductExist) {
        throw new Error(
          "The product is not matched. Please select the correct product."
        );
      }
      return true;
    }),
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddProductVariant = [
  upload.fields([{ name: "productPdf" }]),
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

    const data = {
      productId: req.body.product,
      title: req.body.title,
      description: req.body.description,
      pdf: pdfPath,
    };

    //save the data
    const newProduct = new ProductVariantsModel(data);
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
          .json({ msg: "Product variant has been added successfully." });
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
  body("product")
    .notEmpty()
    .trim()
    .withMessage("The product field is required.")
    .custom(async (value) => {
      getProductId = value;
      const isProductExist = await ProductModel.findOne({ _id: getProductId });
      if (!isProductExist) {
        throw new Error(
          "The product is not matched. Please select the correct product."
        );
      }
      return true;
    }),
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doUpdateProductVariants = [
  upload.fields([{ name: "productPdf" }]),
  updateValidatePdf,
  updateValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const productVariantId = req.body._id;
      const getProductVariant = await ProductVariantsModel.findOne({
        _id: productVariantId,
      });

      if (!getProductVariant) {
        return res
          .status(400)
          .json({ msg: "Unable to find product variant data", eType: "final" });
      }

      let pdfPath = getProductVariant.pdf;

      if (req.files["productPdf"]) {
        //remove old pdf if exist
        if (getProductVariant.pdf) {
          const removePdf = await fsPromisse.unlink(
            path.join(__dirname, "../../", getProductVariant.pdf)
          );
        }

        pdfPath = req.files["productPdf"][0].path;
      }

      getProductVariant.productId = req.body.product;
      getProductVariant.title = req.body.title;
      getProductVariant.description = req.body.description;
      getProductVariant.pdf = pdfPath;
      updateProductVariant = await getProductVariant.save();

      if (!updateProductVariant) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Product variants has been removed sucessfully." });
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

exports.doDeleteProductVariants = [
  validateBefDelete,
  async (req, res, next) => {
    try {
      const productVariantId = req.body.id;
      const getProductVariant = await ProductVariantsModel.findOne({
        _id: productVariantId,
      });

      if (!getProductVariant) {
        return res
          .status(400)
          .json({ msg: "Unable to find product variant data", eType: "final" });
      }

      //check pdf
      if (getProductVariant.pdf) {
        const removePdf = await fsPromisse.unlink(
          path.join(__dirname, "../../", getProductVariant.pdf)
        );
      }

      const isDel = await ProductVariantsModel.findByIdAndDelete(
        productVariantId
      );

      if (isDel) {
        return res
          .status(200)
          .json({ msg: "Product variant has been deleted" });
      }

      return res
        .status(400)
        .json({ msg: "Product variant not found.", eType: "final" });
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

      const isDeleted = await fsPromisse.unlink(
        path.join(__dirname, "../../", attachmentUrl)
      );

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
      const variantId = req.body.id;
      const attachmentUrl = req.body.attachmentUrl;
      const getProductVariant = await ProductVariantsModel.findOne({
        _id: variantId,
      });

      if (!getProductVariant) {
        return res
          .status(400)
          .json({ msg: "Unable to find variant.", eType: "final" });
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

      getProductVariant.pdf = null;
      updateProductVariant = await getProductVariant.save();

      if (!updateProductVariant) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Product Variant PDF has been removed sucessfully." });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];
