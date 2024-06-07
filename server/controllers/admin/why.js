const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const WhyModel = require("../../models/why_model");
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
    cb(null, "uploads/why/");
  },
});
const upload = multer({ storage: storage });

const updateWhyStorage = multer.diskStorage({
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
    cb(null, "uploads/why/");
  },
});
const uploadUpdateWhy = multer({ storage: updateWhyStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.why = (req, res, next) => {
  WhyModel.find()
    .sort({ _id: -1 })
    .then((whyData) => {
      res.render("admin/why/main", {
        title: masterHelper.siteTitle("Why E&E"),
        currentMenu: "why",
        subMenu: "",
        userData: req.session.user,
        whyData: whyData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addWhy = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/why/add", {
    title: masterHelper.siteTitle("Add Why E&E"),
    currentMenu: "why",
    subMenu: "why-add",
    userData: req.session.user,
    whyImg: defImg,
  });
};

exports.editWhy = (req, res, next) => {
  const whyId = req.params.id;

  WhyModel.findOne({ _id: whyId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/why");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/why/edit", {
        title: masterHelper.siteTitle("Edit Why E&E"),
        currentMenu: "why",
        subMenu: "why-edit",
        userData: req.session.user,
        whyData: result,
        whyImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/why");
    });
};

const validateWhyImg = [
  check("whyImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Image is required");
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
  body("description").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddWhy = [
  upload.single("whyImg"),
  validateWhyImg,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      title: req.body.title,
      description: req.body.description,
      image: req.file.path,
    };

    //save the data
    const newWhy = new WhyModel(data);
    newWhy
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
          .json({ msg: "Why E&E has been created successfully." });
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
  body("description").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The banner id is required."),
];

const validateWhyImgWhileUpdate = [
  check("whyImg").custom((value, { req }) => {
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

exports.doUpdateWhy = [
  uploadUpdateWhy.single("whyImg"),
  validateWhyImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const whyId = req.body._id;

    //check if id exist
    WhyModel.findOne({ _id: whyId })
      .then((getWhy) => {
        if (!getWhy) {
          console.log(getWhy);
          return res
            .status(400)
            .json({ msg: "Unable to find why E&E data", eType: "final" });
        }

        if (req.file) {
          if (getWhy.image) {
            fs.unlink(path.join(__dirname, "../../", getWhy.image), (err) => {
              console.log(err);
            });
          }

          getWhy.image = req.file.path;
        }

        getWhy.title = req.body.title;
        getWhy.description = req.body.description;
        return getWhy.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Why E&E has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find why E&E data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The why E&E id is required."),
];

exports.doDeleteWhy = [
  validateBefDelete,
  (req, res, next) => {
    const whyId = req.body.id;

    WhyModel.findOne({ _id: whyId })
      .then((why) => {
        if (!why) {
          return res
            .status(400)
            .json({ msg: "Unable to find why E&E.", eType: "final" });
        }

        if (why.image) {
          fs.unlink(path.join(__dirname, "../../", why.image), (err) => {
            console.log(err);
          });
        }

        return WhyModel.findByIdAndDelete(whyId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Why E&E has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Why E&E not found.", eType: "final" });
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
