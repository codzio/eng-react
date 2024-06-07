const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path");
const JobModel = require("../../models/job_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.job = async (req, res, next) => {
  try {
    const jobData = await JobModel.find().sort({ _id: -1 });
    const { user } = req.session;
    res.render("admin/job/main", {
      title: masterHelper.siteTitle("Jobs"),
      currentMenu: "job",
      subMenu: "",
      userData: user,
      jobData: jobData,
    });
  } catch (err) {
    console.error("Error retrieving data:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.addJob = (req, res, next) => {
  try {
    const { user } = req.session;

    res.render("admin/job/add", {
      title: masterHelper.siteTitle("Add Job"),
      currentMenu: "job",
      subMenu: "job-add",
      userData: user,
    });
  } catch (err) {
    console.error("Error rendering add job page:", err);
    res.status(500).send("Internal Server Error");
  }
};

exports.editJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const getJob = await JobModel.findById({ _id: jobId });

    if (!getJob) {
      return res.redirect("/admin/job");
    }

    res.render("admin/job/edit", {
      title: masterHelper.siteTitle("Edit Job"),
      currentMenu: "job",
      subMenu: "job-edit",
      userData: req.session.user,
      jobData: getJob,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const validation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("slug")
    .notEmpty()
    .trim()
    .withMessage("The slug field is required.")
    .custom(async (value) => {
      newValue = masterHelper.slugify(value);

      const isSlugExist = await JobModel.findOne({ slug: newValue });
      if (isSlugExist) {
        throw new Error("The slug is already in used.");
      }

      return true;
    }),
  body("department")
    .notEmpty()
    .trim()
    .withMessage("The department field is required."),
  body("location")
    .notEmpty()
    .trim()
    .withMessage("The location field is required."),
  body("description")
    .notEmpty()
    .trim()
    .withMessage("The description field is required."),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddJob = [
  validation,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    try {
      const data = {
        title: req.body.title,
        slug: masterHelper.slugify(req.body.slug),
        department: req.body.department,
        location: req.body.location,
        description: req.body.description,
      };

      const newJob = new JobModel(data);
      const result = await newJob.save();

      if (!result) {
        console.log(result);
        return res.status(400).json({
          msg: "Something went wrong while adding job.",
          eType: "final",
        });
      }

      return res.status(200).json({ msg: "Job has been added successfully." });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
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

      const isSlugExist = await JobModel.findOne({
        slug: newValue,
        _id: { $ne: req.body._id },
      });

      if (isSlugExist) {
        throw new Error("The slug is already in used.");
      }

      return true;
    }),
  body("department")
    .notEmpty()
    .trim()
    .withMessage("The department field is required."),
  body("location")
    .notEmpty()
    .trim()
    .withMessage("The location field is required."),
  body("description")
    .notEmpty()
    .trim()
    .withMessage("The description field is required."),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doUpdateJob = [
  updateValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const jobId = req.body._id;
      const getJob = await JobModel.findOne({ _id: jobId });

      if (!getJob) {
        return res
          .status(400)
          .json({ msg: "Unable to find job data", eType: "final" });
      }

      getJob.title = req.body.title;
      getJob.slug = masterHelper.slugify(req.body.slug);
      getJob.department = req.body.department;
      getJob.location = req.body.location;
      getJob.description = req.body.description;
      updateJob = await getJob.save();

      if (!updateJob) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res.status(200).json({ msg: "Job has been updated sucessfully." });
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
  body("id").notEmpty().trim().withMessage("The job id is required."),
];

exports.doDeleteJob = [
  validateBefDelete,
  async (req, res, next) => {
    try {
      const jobId = req.body.id;
      const getJob = await JobModel.findOne({ _id: jobId });

      if (!getJob) {
        return res
          .status(400)
          .json({ msg: "Unable to find job data", eType: "final" });
      }

      const isDel = await JobModel.findByIdAndDelete(jobId);

      if (isDel) {
        return res.status(200).json({ msg: "Job has been deleted" });
      }

      return res.status(400).json({ msg: "Job not found.", eType: "final" });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];

// const validateBefDeleteAddImg = [
//   body("csrf").custom(isCsrfValid),
//   body("id").notEmpty().trim().withMessage("The product id is required."),
//   body("attachmentUrl")
//     .notEmpty()
//     .trim()
//     .withMessage("The attachment url is required."),
// ];

// exports.doDeleteAddImg = [
//   validateBefDeleteAddImg,
//   async (req, res, next) => {
//     try {
//       const productId = req.body.id;
//       const attachmentUrl = req.body.attachmentUrl;
//       const getProduct = await ProductModel.findOne({ _id: productId });

//       if (!getProduct) {
//         return res
//           .status(400)
//           .json({ msg: "Unable to find product.", eType: "final" });
//       }

//       const extractAddImg = getProduct.addImages;
//       const newAddImgObj = [];

//       extractAddImg.forEach((getImg) => {
//         if (getImg != attachmentUrl) {
//           newAddImgObj.push(getImg);
//         }
//       });

//       if (fs.existsSync(path.join(__dirname, "../../", attachmentUrl))) {
//         const isDeleted = await fsPromisse.unlink(
//           path.join(__dirname, "../../", attachmentUrl)
//         );
//       } else {
//         const isDeleted = true;
//       }

//       // const isDeleted = await fsPromisse.unlink(
//       //   path.join(__dirname, "../../", attachmentUrl)
//       // );

//       if (typeof isDeleted != "undefined") {
//         return res.status(400).json({
//           msg: "Something went wrong while deleting.",
//           eType: "final",
//         });
//       }

//       getProduct.addImages = newAddImgObj;
//       updateProduct = await getProduct.save();

//       if (!updateProduct) {
//         return res
//           .status(400)
//           .json({ msg: "Something went wrong.", eType: "final" });
//       }

//       return res
//         .status(200)
//         .json({ msg: "Image has been removed sucessfully." });
//     } catch (error) {
//       console.log(error);
//       return res
//         .status(400)
//         .json({ msg: "Something went wrong.", eType: "final" });
//     }
//   },
// ];

// exports.doDeletePdf = [
//   validateBefDeleteAddImg,
//   async (req, res, next) => {
//     try {
//       const productId = req.body.id;
//       const attachmentUrl = req.body.attachmentUrl;
//       const getProduct = await ProductModel.findOne({ _id: productId });

//       if (!getProduct) {
//         return res
//           .status(400)
//           .json({ msg: "Unable to find product.", eType: "final" });
//       }

//       const isDeleted = await fsPromisse.unlink(
//         path.join(__dirname, "../../", attachmentUrl)
//       );

//       if (typeof isDeleted != "undefined") {
//         return res.status(400).json({
//           msg: "Something went wrong while deleting.",
//           eType: "final",
//         });
//       }

//       getProduct.pdf = null;
//       updateProduct = await getProduct.save();

//       if (!updateProduct) {
//         return res
//           .status(400)
//           .json({ msg: "Something went wrong.", eType: "final" });
//       }

//       return res
//         .status(200)
//         .json({ msg: "Product PDF has been removed sucessfully." });
//     } catch (error) {
//       console.log(error);
//       return res
//         .status(400)
//         .json({ msg: "Something went wrong.", eType: "final" });
//     }
//   },
// ];

// exports.getSubCategory = [
//   async (req, res, next) => {
//     try {
//       const categoryId = req.body.categoryId;
//       const getSubCategory = await SubcategoryModel.find({
//         prodCategory: categoryId,
//       });

//       // let options = '<option value="">Select Sub Category</option>';

//       // getSubCategory.forEach((subCat) => {
//       //   options += `<option value="${subCat._id}">${subCat.title}</option>`;
//       // });
//       return res.status(200).json({ subcategory: getSubCategory });
//     } catch (error) {
//       console.log(error);
//       return res
//         .status(400)
//         .json({ msg: "Something went wrong.", eType: "final" });
//     }
//   },
// ];
