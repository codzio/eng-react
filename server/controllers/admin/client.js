const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const ClientModel = require("../../models/client_model");
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
    cb(null, "uploads/client/");
  },
});
const upload = multer({ storage: storage });

const updateClientStorage = multer.diskStorage({
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
    cb(null, "uploads/client/");
  },
});
const uploadUpdateClient = multer({ storage: updateClientStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.client = (req, res, next) => {
  ClientModel.find()
    .sort({ _id: -1 })
    .then((clientData) => {
      res.render("admin/client/main", {
        title: masterHelper.siteTitle("Client"),
        currentMenu: "client",
        subMenu: "",
        userData: req.session.user,
        clientData: clientData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addClient = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/client/add", {
    title: masterHelper.siteTitle("Add Client"),
    currentMenu: "client",
    subMenu: "client-add",
    userData: req.session.user,
    clientImg: defImg,
  });
};

exports.editClient = (req, res, next) => {
  const clientId = req.params.id;

  ClientModel.findOne({ _id: clientId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/client");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/client/edit", {
        title: masterHelper.siteTitle("Edit Client"),
        currentMenu: "client",
        subMenu: "client-edit",
        userData: req.session.user,
        clientData: result,
        clientImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/client");
    });
};

const validateClientImg = [
  check("clientImg").custom((value, { req }) => {
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

exports.doAddClient = [
  upload.single("clientImg"),
  validateClientImg,
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
    const newClient = new ClientModel(data);
    newClient
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
          .json({ msg: "Client has been created successfully." });
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

const validateClientImgWhileUpdate = [
  check("clientImg").custom((value, { req }) => {
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

exports.doUpdateClient = [
  uploadUpdateClient.single("clientImg"),
  validateClientImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const clientId = req.body._id;

    //check if id exist
    ClientModel.findOne({ _id: clientId })
      .then((getClient) => {
        if (!getClient) {
          console.log(getClient);
          return res
            .status(400)
            .json({ msg: "Unable to find client data", eType: "final" });
        }

        if (req.file) {
          if (getClient.image) {
            fs.unlink(
              path.join(__dirname, "../../", getClient.image),
              (err) => {
                console.log(err);
              }
            );
          }

          getClient.image = req.file.path;
        }

        getClient.title = req.body.title;        
        return getClient.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Client has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find client data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The client id is required."),
];

exports.doDeleteClient = [
  validateBefDelete,
  (req, res, next) => {
    const clientId = req.body.id;

    ClientModel.findOne({ _id: clientId })
      .then((client) => {
        if (!client) {
          return res
            .status(400)
            .json({ msg: "Unable to find client.", eType: "final" });
        }

        if (client.image) {
          fs.unlink(path.join(__dirname, "../../", client.image), (err) => {
            console.log(err);
          });
        }

        return ClientModel.findByIdAndDelete(clientId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Client has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Client not found.", eType: "final" });
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
