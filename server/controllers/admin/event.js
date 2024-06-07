const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const EventModel = require("../../models/event_model");
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
    cb(null, "uploads/event/");
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
    cb(null, "uploads/event/");
  },
});
const uploadUpdateEvent = multer({ storage: updateEventStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.event = (req, res, next) => {
  EventModel.find()
    .sort({ _id: -1 })
    .then((eventData) => {
      res.render("admin/event/main", {
        title: masterHelper.siteTitle("Event"),
        currentMenu: "event",
        subMenu: "",
        userData: req.session.user,
        eventData: eventData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addEvent = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/event/add", {
    title: masterHelper.siteTitle("Add Event"),
    currentMenu: "event",
    subMenu: "event-add",
    userData: req.session.user,
    eventImg: defImg,
  });
};

exports.editEvent = (req, res, next) => {
  const eventId = req.params.id;

  EventModel.findOne({ _id: eventId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/event");
      }

      let defImg = "../../media/blank.svg";

      if (result.image) {
        defImg = masterHelper.siteUrl() + result.image;
      }

      res.render("admin/event/edit", {
        title: masterHelper.siteTitle("Edit Event"),
        currentMenu: "event",
        subMenu: "event-edit",
        userData: req.session.user,
        eventData: result,
        eventImg: defImg,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/event");
    });
};

const validateEventImg = [
  check("eventImg").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Event image is required");
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

exports.doAddEvent = [
  upload.single("eventImg"),
  validateEventImg,
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
    const newEvent = new EventModel(data);
    newEvent
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
          .json({ msg: "Event has been created successfully." });
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
  body("_id").notEmpty().trim().withMessage("The event id is required."),
];

const validateEventImgWhileUpdate = [
  check("eventImg").custom((value, { req }) => {
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

exports.doUpdateEvent = [
  uploadUpdateEvent.single("eventImg"),
  validateEventImgWhileUpdate,
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const eventId = req.body._id;

    //check if id exist
    EventModel.findOne({ _id: eventId })
      .then((getEvent) => {
        if (!getEvent) {
          console.log(getEvent);
          return res
            .status(400)
            .json({ msg: "Unable to find event data", eType: "final" });
        }

        if (req.file) {
          if (getEvent.image) {
            fs.unlink(path.join(__dirname, "../../", getEvent.image), (err) => {
              console.log(err);
            });
          }

          getEvent.image = req.file.path;
        }

        getEvent.title = req.body.title;
        getEvent.description = req.body.description;
        return getEvent.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "Event has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find event data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The event id is required."),
];

exports.doDeleteEvent = [
  validateBefDelete,
  (req, res, next) => {
    const eventId = req.body.id;

    EventModel.findOne({ _id: eventId })
      .then((event) => {
        if (!event) {
          return res
            .status(400)
            .json({ msg: "Unable to find event.", eType: "final" });
        }

        if (event.image) {
          fs.unlink(path.join(__dirname, "../../", event.image), (err) => {
            console.log(err);
          });
        }

        return EventModel.findByIdAndDelete(eventId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "Event has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "Event not found.", eType: "final" });
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
