const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const BannerModel = require("../../models/banner_model");
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
    cb(null, "uploads/banner/");
  },
});
const upload = multer({ storage: storage });

const updateBannerStorage = multer.diskStorage({
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
    cb(null, "uploads/banner/");
  },
});
const uploadUpdateBanner = multer({ storage: updateBannerStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.banner = (req, res, next) => {
  BannerModel.find()
    .sort({ _id: -1 })
    .then((bannerData) => {
      res.render("admin/banner/main", {
        title: masterHelper.siteTitle("Banner"),
        currentMenu: "banner",
        subMenu: "",
        userData: req.session.user,
        bannerData: bannerData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addBanner = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/banner/add", {
    title: masterHelper.siteTitle("Add Banner"),
    currentMenu: "banner",
    subMenu: "banner-add",
    userData: req.session.user,
    bannerImg: defImg,
  });
};

exports.editBanner = (req, res, next) => {
  const bannerId = req.params.id;

  BannerModel.findOne({ _id: bannerId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/banner");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/banner/edit", {
        title: masterHelper.siteTitle("Edit Banner"),
        currentMenu: "banner",
        subMenu: "banner-edit",
        userData: req.session.user,
        bannerData: result,
        bannerImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/banner");
    });
};

const validateBannerImg = [
  check("bannerImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Banner image is required");
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
  body("metaTitle").optional({ nullable: true, checkFalsy: true }),
  body("metaDescription").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddBanner = [
  upload.single("bannerImg"),
  validateBannerImg,
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
    const newBanner = new BannerModel(data);
    newBanner
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res
            .status(400)
            .json({
              msg: "Something went wrong while creating blog.",
              eType: "final",
            });
        }

        return res
          .status(200)
          .json({ msg: "Banner has been created successfully." });
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

const validateBannerImgWhileUpdate = [
  check("bannerImg").custom((value, { req }) => {
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

exports.doUpdateBanner = [
  uploadUpdateBanner.single("bannerImg"),
  validateBannerImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const bannerId = req.body._id;

    //check if id exist
    BannerModel.findOne({ _id: bannerId })
      .then((getBanner) => {
        if (!getBanner) {
          console.log(getBanner);
          return res
            .status(400)
            .json({ msg: "Unable to find banner data", eType: "final" });
        }

        if (req.file) {
          if (getBanner.image) {
            fs.unlink(
              path.join(__dirname, "../../", getBanner.image),
              (err) => {
                console.log(err);
              }
            );
          }

          getBanner.image = req.file.path;
        }

        getBanner.title = req.body.title;
        getBanner.description = req.body.description;
        return getBanner.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Banner has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find banner data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The banner id is required."),
];

exports.doDeleteBanner = [
  validateBefDelete,
  (req, res, next) => {
    const bannerId = req.body.id;

    BannerModel.findOne({ _id: bannerId })
      .then((banner) => {
        if (!banner) {
          return res
            .status(400)
            .json({ msg: "Unable to find banner.", eType: "final" });
        }

        if (banner.image) {
          fs.unlink(path.join(__dirname, "../../", banner.image), (err) => {
            console.log(err);
          });
        }

        return BannerModel.findByIdAndDelete(bannerId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Banner has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Banner not found.", eType: "final" });
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
