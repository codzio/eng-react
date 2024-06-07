const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const path = require("path");
const VideoModel = require("../../models/video_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");

// Set up Multer storage and validation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let destination = "uploads/video/";
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
    file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image are allowed"), false);
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

const updateVideoStorage = multer.diskStorage({
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
    cb(null, "uploads/video/");
  },
});
const uploadUpdateProduct = multer({ storage: updateVideoStorage });

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.video = async (req, res, next) => {

  try {

    const videoData = await VideoModel.find().sort({ _id: -1 });

    res.render("admin/video/main", {
      title: masterHelper.siteTitle("Videos"),
      currentMenu: "video",
      subMenu: "",
      userData: req.session.user,
      videoData: videoData,
    });

  } catch(err) {
    console.error("Error retrieving data:", err);
    return res.status(500).send("Internal Server Error");
  }
};

exports.addVideo = (req, res, next) => {
  let defImg = "../../media/blank.svg";
  res.render("admin/video/add", {
    title: masterHelper.siteTitle("Add Video"),
    currentMenu: "video",
    subMenu: "video-add",
    userData: req.session.user,
    pdf: defImg,
  });
};

exports.editVideo = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const getVideo = await VideoModel.findById(videoId);

    if (!getVideo) {
      return res.redirect("/admin/video");
    }

    let defImg = "../../media/blank.svg";

    if (getVideo.featuredImg) {
      defImg = masterHelper.siteUrl() + getVideo.featuredImg;
    }

    res.render("admin/video/edit", {
      title: masterHelper.siteTitle("Edit Video"),
      currentMenu: "video",
      subMenu: "video-edit",
      userData: req.session.user,
      videoData: getVideo,
      pdf: defImg,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

const validateFeaturedImg = [
  check("featuredImg").custom((value, { req }) => {
    if (!req.body._id) {
      if (!req.files.featuredImg) {
        throw new Error("Featured image is required");
      }
    }

    if (req.files.featuredImg) {
      // Check file type (accept png, jpeg, jpg)
      const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(req.files.featuredImg[0].mimetype)) {
        throw new Error(
          "Invalid file type. Please upload a PNG, JPEG, or JPG image"
        );
      }

      // Check file size (max 500 KB)
      const maxSize = 2 * 1024 * 1024; // 500 KB in bytes
      if (req.files.featuredImg[0].size > maxSize) {
        throw new Error("File size exceeds the limit of 2 MB");
      }
    }

    return true;
  }),
];

const validation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("category")
    .notEmpty()
    .trim()
    .withMessage("The category field is required."),
  body("video")
    .notEmpty()
    .trim()
    .withMessage("The video field is required."),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddVideo = [
  upload.fields([
    { name: "featuredImg", maxCount: 1 },
  ]),
  validateFeaturedImg,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      title: req.body.title,
      category: req.body.category,
      video: req.body.video,
      featuredImg: req.files["featuredImg"][0].path,
    };

    //save the data
    const newVideo = new VideoModel(data);
    newVideo
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res.status(400).json({
            msg: "Something went wrong while creating video.",
            eType: "final",
          });
        }

      return res
        .status(200)
        .json({ msg: "Vidoe has been added successfully." });
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
  body("video")
    .notEmpty()
    .trim()
    .withMessage("The video field is required."),  
  body("_csrf").custom(isCsrfValid),
  body("_id").notEmpty().trim().withMessage("The product id is required."),
];

exports.doUpdateVideo = [
  upload.fields([
    { name: "featuredImg", maxCount: 1 },
  ]),
  validateFeaturedImg,
  updateValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const videoId = req.body._id;
      const getVideo = await VideoModel.findOne({ _id: videoId });

      if (!getVideo) {
        return res
          .status(400)
          .json({ msg: "Unable to find video data", eType: "final" });
      }

      let featuredImg = getVideo.featuredImg;

      if (req.files["featuredImg"]) {
        const featuredImgPath = path.join(
          __dirname,
          "../../",
          getVideo.featuredImg
        );

        if (fs.existsSync(featuredImgPath)) {
          await fsPromisse.unlink(featuredImgPath);
        }

        featuredImg = req.files["featuredImg"][0].path;
      }

      getVideo.title = req.body.title;
      getVideo.category = req.body.category;      
      getVideo.video = req.body.video;
      getVideo.featuredImg = featuredImg;

      updateVideo = await getVideo.save();

      if (!updateVideo) {
        return res.status(400).json({ msg: "Something went wrong.", eType: "final" });
      }

      return res.status(200).json({ msg: "Video has been updated sucessfully." });

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
  body("id").notEmpty().trim().withMessage("The video id is required."),
];

exports.doDeleteVideo = [
  validateBefDelete,
  async (req, res, next) => {
    try {
      const videoId = req.body.id;
      const getVideo = await VideoModel.findOne({ _id: videoId });

      if (!getVideo) {
        return res
          .status(400)
          .json({ msg: "Unable to find video data", eType: "final" });
      }

      //check featured img
      if (getVideo.featuredImg) {
        // const removeFeaturedImg = await fsPromisse.unlink(
        //   path.join(__dirname, "../../", getVideo.featuredImg)
        // );
        if (
          fs.existsSync(path.join(__dirname, "../../", getVideo.featuredImg))
        ) {
          await fsPromisse.unlink(
            path.join(__dirname, "../../", getVideo.featuredImg)
          );
        }
      }

      const isDel = await VideoModel.findByIdAndDelete(videoId);

      if (isDel) {
        return res.status(200).json({ msg: "Video has been deleted" });
      }

      return res.status(400).json({ msg: "Video not found.", eType: "final" });

    } catch (err) {
      console.log(err);
      return res
        .status(400)
        .json({ msg: "Something went wrong.", eType: "final" });
    }
  },
];