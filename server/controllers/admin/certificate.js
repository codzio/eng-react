const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const CertificateModel = require("../../models/certificate_model");
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
    cb(null, "uploads/certificate/");
  },
});
const upload = multer({ storage: storage });

const updateCertificateStorage = multer.diskStorage({
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
    cb(null, "uploads/certificate/");
  },
});
const uploadUpdateCertificate = multer({ storage: updateCertificateStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.certificate = (req, res, next) => {
  CertificateModel.find()
    .sort({ _id: -1 })
    .then((certificateData) => {
      res.render("admin/certificate/main", {
        title: masterHelper.siteTitle("Certificate"),
        currentMenu: "certificate",
        subMenu: "",
        userData: req.session.user,
        certificateData: certificateData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addCertificate = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/certificate/add", {
    title: masterHelper.siteTitle("Add certificate"),
    currentMenu: "certificate",
    subMenu: "certificate-add",
    userData: req.session.user,
    certificateImg: defImg,
  });
};

exports.editCertificate = (req, res, next) => {
  const certificateId = req.params.id;

  CertificateModel.findOne({ _id: certificateId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/certificate");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/certificate/edit", {
        title: masterHelper.siteTitle("Edit Client"),
        currentMenu: "certificate",
        subMenu: "certificate-edit",
        userData: req.session.user,
        certificateData: result,
        certificateImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/certificate");
    });
};

const validateCertificateImg = [
  check("certificateImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Client image is required");
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

exports.doAddCertificate = [
  upload.single("certificateImg"),
  validateCertificateImg,
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
    const newCertificate = new CertificateModel(data);
    newCertificate
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
          .json({ msg: "Certificate has been created successfully." });
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
  body("_id").notEmpty().trim().withMessage("The client id is required."),
];

const validateCertificateImgWhileUpdate = [
  check("certificateImg").custom((value, { req }) => {
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

exports.doUpdateCertificate = [
  uploadUpdateCertificate.single("certificateImg"),
  validateCertificateImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const certificateId = req.body._id;

    //check if id exist
    CertificateModel.findOne({ _id: certificateId })
      .then((getCertificate) => {
        if (!getCertificate) {
          console.log(getCertificate);
          return res
            .status(400)
            .json({ msg: "Unable to find certificateId data", eType: "final" });
        }

        if (req.file) {
          if (getCertificate.image) {
            fs.unlink(
              path.join(__dirname, "../../", getCertificate.image),
              (err) => {
                console.log(err);
              }
            );
          }

          getCertificate.image = req.file.path;
        }

        getCertificate.title = req.body.title;        
        return getCertificate.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Certificate has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find certificate data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The certificate id is required."),
];

exports.doDeleteCertificate = [
  validateBefDelete,
  (req, res, next) => {
    const certificateId = req.body.id;

    CertificateModel.findOne({ _id: certificateId })
      .then((certificate) => {
        if (!certificate) {
          return res
            .status(400)
            .json({ msg: "Unable to find certificate.", eType: "final" });
        }

        if (certificate.image) {
          fs.unlink(path.join(__dirname, "../../", certificate.image), (err) => {
            console.log(err);
          });
        }

        return CertificateModel.findByIdAndDelete(certificateId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Certificate has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Certificate not found.", eType: "final" });
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
