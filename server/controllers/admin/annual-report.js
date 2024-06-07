const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path");
const AnnualReportModel = require("../../models/annual_report_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const { category } = require("./category");

// Set up Multer storage and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = "uploads/annual-report/";
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
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
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

const updateAnnualReportStorage = multer.diskStorage({
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
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only pdf are allowed."));
    }
  },
  destination: (req, file, cb) => {
    cb(null, "uploads/annual-report/");
  },
});
const uploadUpdateAnnualReport = multer({ storage: updateAnnualReportStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.annualReport =  async (req, res, next) => {

  try{

    const annualReportData = await AnnualReportModel.find().sort({_id: -1});

    res.render("admin/annual-report/main", {
      title: masterHelper.siteTitle("Annual Report"),
      currentMenu: "annual-report",
      subMenu: "",
      userData: req.session.user,
      annualReportData: annualReportData,
    });

  } catch(err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.addAnnualReport = async (req, res, next) => {
  try {
    
    let defImg = "../../media/blank.svg";

    res.render("admin/annual-report/add", {
      title: masterHelper.siteTitle("Add Annual Report"),
      currentMenu: "annual-report",
      subMenu: "annual-report-add",
      userData: req.session.user,
      pdf: defImg,
    });

  } catch (err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.editAnnualReport = async (req, res, next) => {
  try {
    const annualReportId = req.params.id;
    const getAnnualReport = await AnnualReportModel.findById({ _id: annualReportId });

    if (!getAnnualReport) {
      return res.redirect("/admin/annual-report");
    }

    let defImg = "../../media/blank.svg";

    await res.render("admin/annual-report/edit", {
      title: masterHelper.siteTitle("Edit Annual Report"),
      currentMenu: "annual-report",
      subMenu: "annual-report-edit",
      userData: req.session.user,
      annualReportData: getAnnualReport,
      pdf: defImg,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const validatePdf = [
  check("pdf").custom((value, { req }) => {
    // if (!req.file) {
    //   throw new Error('PDF is required');
    // }

    if (req.files.pdf) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["application/pdf"];
      if (!allowedTypes.includes(req.files.pdf[0].mimetype)) {
        throw new Error("Invalid file type. Please upload a PDF");
      }

      // Check file size (max 500 KB)
      const maxSize = 5 * 1024 * 1024; // 500 KB in bytes
      if (req.files.pdf[0].size > maxSize) {
        throw new Error("File size exceeds the limit of 5 MB");
      }
    }

    return true;
  }),
];

const validation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("category").notEmpty().trim().withMessage("The category field is required."),
  body("description").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddAnnualReport = [
  upload.fields([    
    { name: "pdf" },
  ]),
  validatePdf,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    let pdfPath = null;

    if (req.files["pdf"]) {
      pdfPath = req.files["pdf"][0].path;
    }

    const data = {
      title: req.body.title,
      category: req.body.category,
      description: req.body.description,
      pdf: pdfPath,
    };

    //save the data
    const newReport = new AnnualReportModel(data);
    newReport
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res.status(400).json({
            msg: "Something went wrong while adding annual report.",
            eType: "final",
          });
        }

        return res
          .status(200)
          .json({ msg: "Annual Report has been added successfully." });
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
  body("category").notEmpty().trim().withMessage("The category field is required."),
  body("description").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doUpdateAnnualReport = [
  upload.fields([
    { name: "pdf" },
  ]),
  validatePdf,
  updateValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const reportId = req.body._id;
      const getAnnualReport = await AnnualReportModel.findOne({ _id: reportId });

      if (!getAnnualReport) {
        return res
          .status(400)
          .json({ msg: "Unable to find report data", eType: "final" });
      }

      let pdfPath = getAnnualReport.pdf;

      if (req.files["pdf"]) {
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

        pdfPath = req.files["pdf"][0].path;
      }

      getAnnualReport.title = req.body.title;
      getAnnualReport.category = req.body.category;
      getAnnualReport.description = req.body.description || null;
      getAnnualReport.pdf = pdfPath;
      updateAnnualReport = await getAnnualReport.save();

      if (!updateAnnualReport) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      return res
        .status(200)
        .json({ msg: "Annual Report has been updated sucessfully." });
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
  body("id").notEmpty().trim().withMessage("The annual report id is required."),
];

exports.doDeleteAnnualReport = [
  validateBefDelete,
  async (req, res, next) => {
    try {
      const annualReportId = req.body.id;
      const getAnnualReport = await AnnualReportModel.findOne({ _id: annualReportId });

      if (!getAnnualReport) {
        return res
          .status(400)
          .json({ msg: "Unable to find annual report data", eType: "final" });
      }

      //check pdf
      if (getAnnualReport.pdf) {
        // const removePdf = await fsPromisse.unlink(
        //   path.join(__dirname, "../../", getAnnualReport.pdf)
        // );
        if (fs.existsSync(path.join(__dirname, "../../", getAnnualReport.pdf))) {
          await fsPromisse.unlink(
            path.join(__dirname, "../../", getAnnualReport.pdf)
          );
        }
      }

      const isDel = await AnnualReportModel.findByIdAndDelete(annualReportId);

      if (isDel) {
        return res.status(200).json({ msg: "Annual Report has been deleted" });
      }

      return res
        .status(400)
        .json({ msg: "Annual Report not found.", eType: "final" });
    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];
