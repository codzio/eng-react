const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const CategoryModel = require("../../models/product_category_model");
const SubCategoryModel = require("../../models/product_subcategory_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.category = (req, res, next) => {
  SubCategoryModel.find()
    .sort({ _id: -1 })
    .populate("prodCategory")
    .exec()
    .then((categoryData) => {
      res.render("admin/product-subcategory/main", {
        title: masterHelper.siteTitle("Product Sub Category"),
        currentMenu: "product-subcategory",
        subMenu: "",
        userData: req.session.user,
        categoryData: categoryData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addCategory = async (req, res, next) => {
  try {
    const categories = await CategoryModel.find();
    let getCategory = await res.render("admin/product-subcategory/add", {
      title: masterHelper.siteTitle("Add Product Sub Category"),
      currentMenu: "product-subcategory",
      subMenu: "product-subcategory-add",
      userData: req.session.user,
      categories: categories,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.editCategory = async (req, res, next) => {
  try {
    const subCatId = req.params.id;
    const categories = await CategoryModel.find();
    const result = await SubCategoryModel.findOne({ _id: subCatId });

    if (!result) {
      return res.redirect("/admin/product-subcategory");
    }

    let getCategory = await res.render("admin/product-subcategory/edit", {
      title: masterHelper.siteTitle("Edit Product Sub Category"),
      currentMenu: "product-subcategory",
      subMenu: "product-subcategory-edit",
      userData: req.session.user,
      categoryData: result,
      categories: categories,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

const validation = [
  body("category")
    .notEmpty()
    .trim()
    .withMessage("The product category field is required.")
    .custom(async (value) => {
      const isCategoryExist = await CategoryModel.findOne({ _id: value });
      if (!isCategoryExist) {
        throw new Error("The product category is required.");
      }
      return true;
    }),
  body("subcategoryName")
    .notEmpty()
    .trim()
    .withMessage("The product sub category name field is required."),
  body("subcategorySlug")
    .notEmpty()
    .trim()
    .withMessage("The product sub category slug field is required.")
    .custom(async (value) => {
      newValue = masterHelper.slugify(value);
      const isSlugExist = await SubCategoryModel.findOne({ slug: newValue });
      if (isSlugExist) {
        throw new Error("The product sub category slug is already in used.");
      }
      return true;
    }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddCategory = [
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      prodCategory: req.body.category,
      title: req.body.subcategoryName,
      slug: masterHelper.slugify(req.body.subcategorySlug),
      description: req.body.description,
    };

    //save the data
    const newCategory = new SubCategoryModel(data);
    newCategory
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res.status(400).json({
            msg: "Something went wrong while creating category.",
            eType: "final",
          });
        }

        return res
          .status(200)
          .json({ msg: "Product sub category has been created successfully." });
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
  body("category")
    .notEmpty()
    .trim()
    .withMessage("The product category field is required.")
    .custom(async (value) => {
      const isCategoryExist = await CategoryModel.findOne({ _id: value });
      if (!isCategoryExist) {
        throw new Error("The product category is required.");
      }
      return true;
    }),
  body("subcategoryName")
    .notEmpty()
    .trim()
    .withMessage("The product sub category name field is required."),
  body("subcategorySlug")
    .notEmpty()
    .trim()
    .withMessage("The product sub category slug field is required.")
    .custom(async (value, { req }) => {
      newValue = masterHelper.slugify(value);
      const isSlugExist = await SubCategoryModel.findOne({
        slug: newValue,
        _id: { $ne: req.body._id },
      });
      if (isSlugExist) {
        throw new Error("The product sub category slug is already in used.");
      }

      return true;
    }),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The sub category id is required."),
];

exports.doUpdateCategory = [
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const catId = req.body._id;

    //check if id exist
    SubCategoryModel.findOne({ _id: catId })
      .then((getCategory) => {
        if (!getCategory) {
          console.log(getCategory);
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }

        getCategory.prodCategory = req.body.category;
        getCategory.title = req.body.subcategoryName;
        getCategory.slug = masterHelper.slugify(req.body.subcategorySlug);
        getCategory.description = req.body.description;
        return getCategory.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }

        return res
          .status(200)
          .json({ msg: "Product category has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          msg: "Unable to find product category data",
          eType: "final",
        });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id")
    .notEmpty()
    .trim()
    .withMessage("The product category id is required."),
];

exports.doDeleteCategory = [
  validateBefDelete,
  (req, res, next) => {
    const catId = req.body.id;

    SubCategoryModel.findByIdAndDelete(catId)
      .then((deleteCat) => {
        if (deleteCat) {
          return res
            .status(200)
            .json({ msg: "Product sub category has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Product sub category not found.", eType: "final" });
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
