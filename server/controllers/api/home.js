const path = require("path");
const { body, check, validationResult } = require("express-validator");
const multer = require("multer");
const fs = require("fs");
const fsPromisse = require("fs").promises;
const nodemailer = require("nodemailer");

const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const BannerModel = require("../../models/banner_model");
const UseCasesModel = require("../../models/use_cases_model");
const WhyModel = require("../../models/why_model");
const ProductModel = require("../../models/product_model");
const TestimonialModel = require("../../models/testimonial_model");
const ClientModel = require("../../models/client_model");
const PageModel = require("../../models/page_model");
const EventModel = require("../../models/event_model");
const CertificateModel = require("../../models/certificate_model");
const ContactModel = require("../../models/contact_model");
const CareerModel = require("../../models/career_model");
const SiteSettingModel = require("../../models/site_settings_model");
const CategoryModel = require("../../models/product_category_model");
const ProjectModel = require("../../models/project_model");
const JobModel = require("../../models/job_model");

const AnnualReportModel = require("../../models/annual_report_model");
const VideoModel = require("../../models/video_model");

//Cache
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 1200 });

exports.getHomePage = async (req, res, next) => {
  try {
    // Check if data is cached
    const cachedData = cache.get("homePageData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    // Run independent queries in parallel
    const [
      getBanners,
      getUseCases,
      whyEAndE,
      products,
      testimonials,
      clients,
      getCategoryIds,
      getPage,
      projects,
    ] = await Promise.all([
      BannerModel.find().sort({ _id: -1 }),
      UseCasesModel.find({ homepage: true })
        .sort({ _id: -1 })
        .populate("services"),
      WhyModel.find(),
      ProductModel.find({ homepage: true }).sort({ _id: -1 }).limit(10),
      TestimonialModel.find().sort({ _id: -1 }),
      ClientModel.find(),
      ProductModel.distinct("prodCategory"),
      PageModel.find({ slug: "home" }),
      ProjectModel.find({ homepage: true }).sort({ _id: -1 }),
    ]);

    // Fetch categories data and their products
    const getCategoryData = await CategoryModel.find({
      _id: { $in: getCategoryIds },
    });

    const newData = await Promise.all(
      getCategoryData.map(async (categoryData) => {
        const getCategoryProducts = await ProductModel.findOne({
          prodCategory: categoryData._id,
          product: null,
        }).select("_id title slug prodCategory");

        return {
          category: categoryData.toObject(),
          product: getCategoryProducts ? getCategoryProducts.toObject() : null,
        };
      })
    );

    // Cache the fetched data
    const homePageData = {
      siteUrl: masterHelper.siteUrl(),
      banners: getBanners,
      useCases: getUseCases,
      why: whyEAndE,
      products: products,
      projects: projects,
      testimonials: testimonials,
      clients: clients,
      prodCat: getCategoryData,
      prodCatUpdated: newData,
      home: getPage,
    };

    cache.set("homePageData", homePageData);
    res.status(200).json(homePageData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
};

exports.getComman = async (req, res, next) => {
  try {
    // Check if data is cached
    const cachedData = cache.get("commonData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    // Run independent queries in parallel
    const [getSettings, getCategoryIds] = await Promise.all([
      SiteSettingModel.find().sort({ _id: -1 }),
      ProductModel.distinct("prodCategory"),
    ]);

    // Fetch category data
    const getCategoryData = await CategoryModel.find({
      _id: { $in: getCategoryIds },
    });

    // Fetch products and their sub-products in parallel
    const newData = await Promise.all(
      getCategoryData.map(async (categoryData) => {
        const getCategoryProducts = await ProductModel.find({
          prodCategory: categoryData._id,
          product: null,
        }).select("_id title slug prodCategory disableLinking");

        const createProductAndSubProduct = await Promise.all(
          getCategoryProducts.map(async (subProduct) => {
            const subProductObject = {
              ...subProduct.toObject(),
              subProduct: [],
            };

            const getSubProducts = await ProductModel.find({
              product: subProduct._id,
            }).select("_id title slug prodCategory disableLinking");

            if (getSubProducts.length > 0) {
              subProductObject.subProduct = getSubProducts;
            }

            return subProductObject;
          })
        );

        return {
          category: categoryData.toObject(),
          product: createProductAndSubProduct,
        };
      })
    );

    const formattedSettings = getSettings.map((setting) => {
      const settingObj = setting.toObject();
      settingObj.scripts = settingObj.scripts || {
        header: settingObj.scripts.header,
        footer: settingObj.scripts.footer,
      };
      settingObj.socialLinks = settingObj.socialLinks || {
        facebook: settingObj.socialLinks.facebook,
        twitter: settingObj.socialLinks.twitter,
        instagram: settingObj.socialLinks.instagram,
        youtube: settingObj.socialLinks.youtube,
        linkedin: settingObj.socialLinks.linkedin,
      };
      return settingObj;
    });

    const commonData = {
      siteUrl: masterHelper.siteUrl(),
      common: formattedSettings,
      newData: newData,
    };

    // Cache the fetched data
    cache.set("commonData", commonData);

    res.status(200).json(commonData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
};

exports.getPageData = async (req, res, next) => {
  try {
    // Check if data is cached
    
    const pageSlug = req.params.slug;
    const cacheKey = `page_${pageSlug}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const page = await PageModel.find({ slug: pageSlug });

    if (!page) {
      return res.status(404).json({ msg: "Page not found." });
    }

    const pageData = {
      siteUrl: masterHelper.siteUrl(),
      page: page,
    };

    cache.set(cacheKey, pageData);
    res.status(200).json(pageData);
    
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};

exports.getProjectData = async (req, res, next) => {
  try {
    //Check if data is cached
    const cachedData = cache.get("projectData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const slug = req.params.slug;
    const project = await ProjectModel.find({ slug }).populate("products");

    if (!project) {
      return res.status(404).json({ msg: "Project not found." });
    }

    const projectData = {
      siteUrl: masterHelper.siteUrl(),
      project: project,
    };

    cache.set("projectData", projectData);
    res.status(200).json(projectData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
};

exports.getGalleryData = async (req, res, next) => {
  try {
    // Check if data is cached
    const cachedData = cache.get("galleryData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const [getEvents, getCertificate, getGalleryPageData] = await Promise.all([
      EventModel.find().sort({ _id: -1 }),
      CertificateModel.find().sort({ _id: -1 }),
      PageModel.find({ slug: "gallery" }),
    ]);

    const galleryData = {
      siteUrl: masterHelper.siteUrl(),
      events: getEvents,
      certificate: getCertificate,
      galleryPageData: getGalleryPageData,
    };

    cache.set("galleryData", galleryData);
    res.status(200).json(galleryData);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ msg: "Something went wrong." });
  }
};

exports.getContactData = async (req, res, next) => {};

const contactValidation = [
  body("name").notEmpty().trim().withMessage("The name is required."),
  body("email").trim().isEmail().withMessage("The email is invalid"),
  body("phoneNumber")
    .notEmpty()
    .trim()
    .withMessage("The phone number is required"),
  body("subject").optional({ nullable: true, checkFalsy: true }),
  body("message").optional({ nullable: true, checkFalsy: true }),
];

exports.postContact = async (req, res, next) => {
  try {
    // Validate request body
    await Promise.all(
      contactValidation.map((validation) => validation.run(req))
    );

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      name: req.body.name,
      email: req.body.email,
      phone_number: req.body.phoneNumber,
      subject: req.body.subject,
      message: req.body.message,
    };

    // Save the data
    const newContact = await ContactModel.create(data);

    if (!newContact) {
      console.log(newContact);
      return res
        .status(400)
        .json({ msg: "Something went wrong", eType: "final" });
    }

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Your SMTP server host
      port: 465, // Your SMTP server port
      secure: true, // Set to true if your SMTP server uses SSL/TLS
      auth: {
        user: "alfaizm19@gmail.com",
        pass: "oyvi ygcl iipl bpld",
      },
    });

    const mailOptions = {
      from: "Enggenvsolutions <alfaizm19@gmail.com>", // Sender name and address
      to: "enggenvsolution@gmail.com", // Recipient address
      subject: "Contact Form Submission", // Email subject
      html: `
        <p><strong>Contact details:</strong></p>
        <p><strong>Name:</strong> ${req.body.name}</p>
        <p><strong>Contact Number:</strong> ${req.body.phoneNumber}</p>
        <p><strong>Email:</strong> ${req.body.email}</p>
        <p><strong>Subject:</strong> ${req.body.subject}</p>
        <p><strong>Message:</strong> ${req.body.message}</p>
      `,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    return res
      .status(200)
      .json({ msg: "Thank you. Our team will contact you shortly." });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Something went wrong.", eType: "final" });
  }
};

// Career
const storage = multer.diskStorage({
  destination: "uploads/career/",
  filename: (req, file, cb) => {
    cb(
      null,
      `${masterHelper.slugify(
        path.parse(file.originalname).name
      )}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
  ];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error("Only doc, docx, and pdf files are allowed"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1.5 * 1024 * 1024 }, // 1.5MB maximum file size
});

const validateResume = [
  check("resume").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The resume is required");
    }

    const allowedMimeTypes = [
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/pdf",
    ];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new Error("Invalid file type. Please upload doc, docx, and pdf");
    }

    const maxSize = 1.5 * 1024 * 1024; // 1.5 MB
    if (req.file.size > maxSize) {
      throw new Error("File size exceeds the limit of 1.5 MB");
    }

    return true;
  }),
];

const validation = [
  body("profile")
    .notEmpty()
    .trim()
    .withMessage("The profile field is required."),
  body("firstName")
    .notEmpty()
    .trim()
    .withMessage("The first name is required."),
  body("lastName").notEmpty().trim().withMessage("The last name is required."),
  body("email").trim().isEmail().withMessage("The email is invalid"),
  body("phoneNumber")
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage("The phone number must be numeric.")
    .isLength({ min: 10, max: 15 })
    .withMessage("The phone number must be 10 digit long."),
  body("message").optional({ nullable: true, checkFalsy: true }),
  body("title").optional({ nullable: true, checkFalsy: true }),
];

exports.postCareer = async (req, res, next) => {
  try {
    await upload.single("resume")(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ msg: "File upload error.", eType: "field" });
      } else if (err) {
        return res.status(400).json({ msg: err.message, eType: "field" });
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), eType: "field" });
      }

      const data = {
        profile: req.body.profile,
        jobTitle: req.body.title,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        contact: req.body.phoneNumber,
        message: req.body.message,
        resume: req.file.path,
      };

      const newCareer = await CareerModel.create(data);
      if (!newCareer) {
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      }

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "alfaizm19@gmail.com",
          pass: "oyvi ygcl iipl bpld",
        },
      });

      const mailOptions = {
        from: "Enggenvsolutions <alfaizm19@gmail.com>",
        to: "hr@enggenv.com",
        subject: "Career Form Submission",
        html: `
          <p><strong>Career details:</strong></p>
          <p><strong>Department:</strong> ${req.body.profile}</p>
          <p><strong>Job Title:</strong> ${req.body.title}</p>
          <p><strong>Name:</strong> ${req.body.firstName} ${req.body.lastName}</p>
          <p><strong>Contact Number:</strong> ${req.body.contact}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>Message:</strong> ${req.body.message}</p>
        `,
        attachments: [
          {
            filename: req.file.originalname,
            path: req.file.path,
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Email sent:", info.response);
      return res
        .status(200)
        .json({ msg: "Thank you for sharing your CV with us." });
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ msg: "Something went wrong.", eType: "final" });
  }
};

const enquiryValidation = [
  body("organizationName")
    .notEmpty()
    .trim()
    .withMessage("The organization name is required."),
  body("firstName")
    .notEmpty()
    .trim()
    .withMessage("The first name is required."),
  body("lastName").notEmpty().trim().withMessage("The last name is required."),
  body("designation")
    .notEmpty()
    .trim()
    .withMessage("The designation is required."),
  body("phoneNumber")
    .notEmpty()
    .withMessage("The phone number is required")
    .isNumeric()
    .withMessage("The phone number must be numeric"),
  body("email")
    .notEmpty()
    .withMessage("The email is required")
    .trim()
    .isEmail()
    .withMessage("The email is invalid"),
  body("city").notEmpty().trim().withMessage("The city is required."),
  body("country").notEmpty().trim().withMessage("The country is required."),
  body("product").notEmpty().trim().withMessage("The product is required."),
  body("potentialAssociation")
    .notEmpty()
    .trim()
    .withMessage("The potential association is required."),
  body("productPage")
    .notEmpty()
    .trim()
    .withMessage("The product page is required."),
  body("message").optional({ nullable: true, checkFalsy: true }),
];

exports.postEnquiry = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "alfaizm19@gmail.com",
        pass: "oyvi ygcl iipl bpld",
      },
    });

    const mailOptions = {
      from: "Enggenvsolutions <alfaizm19@gmail.com>",
      to: "enggenvsolution@gmail.com",
      subject: "Enquiry Form Submission",
      html: `
          <p><strong>Enquiry details:</strong></p>
          <p><strong>Organization Name:</strong> ${req.body.organizationName}</p>
          <p><strong>Name:</strong> ${req.body.firstName} ${req.body.lastName}</p>
          <p><strong>Designation:</strong> ${req.body.designation}</p>
          <p><strong>Contact Number:</strong> ${req.body.phoneNumber}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>City:</strong> ${req.body.city}</p>
          <p><strong>Country:</strong> ${req.body.country}</p>
          <p><strong>Product:</strong> ${req.body.product}</p>
          <p><strong>Potential Association:</strong> ${req.body.potentialAssociation}</p>
          <p><strong>Message:</strong> ${req.body.message}</p>
          <p><strong>Product Page:</strong> ${req.body.productPage}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return res
      .status(200)
      .json({ msg: "Thank you. Our team will contact your shortly." });
  } catch (err) {
    console.error("Error sending email:", err);
    return res
      .status(400)
      .json({ msg: "Something went wrong.", eType: "final" });
  }
};

//Job API

exports.getJobs = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    let jobData;

    if (slug) {
      // Check if data is cached
      const cachedData = cache.get(slug);
      if (cachedData) {
        return res.status(200).json(cachedData); // Return cached data if available
      }

      getJob = await JobModel.findOne({ slug });

      if (!getJob) {
        return res.status(404).json({ error: true, message: "Job not found" });
      }

      jobData = {
        siteUrl: masterHelper.siteUrl(),
        jobs: getJob,
      };

      cache.set(slug, jobData);
    } else {
      const cachedData = cache.get("jobData");

      if (cachedData) {
        return res.status(200).json(cachedData); // Return cached data if available
      }

      getJob = await JobModel.find();

      jobData = {
        siteUrl: masterHelper.siteUrl(),
        jobs: getJob,
      };

      cache.set("jobData", jobData);
    }

    return res.status(200).json(jobData);
  } catch (err) {
    console.error("Error retrieving jobs:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//Search API
exports.getSearch = async (req, res, next) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword) {
      return res
        .status(200)
        .json({ error: true, message: "The keyword is missing" });
    }
    //search the keyword in product table
    const query = {
      $or: [
        { title: { $regex: keyword, $options: "i" } }, // Case-insensitive search by title
        { description: { $regex: keyword, $options: "i" } }, // Case-insensitive search by description
      ],
    };

    // Fetch products matching the search query
    const products = await ProductModel.find(query)
      .select("_id title slug")
      .limit(5);

    // Return the search results
    return res.status(200).json(products);
  } catch (err) {
    console.error("Error retrieving jobs:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getProductCat = async (req, res, next) => {
  try {
    const slug = req.params.slug;

    if (slug) {
      // Check if data is cached
      const cacheKey = `product_by_cat_${slug}`;
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(cachedData); // Return cached data if available
      }

      const category = await CategoryModel.findOne({ slug: slug });
      if (!category) {
        return res
          .status(404)
          .json({ error: true, message: "Category not found" });
      }

      // Find products by category ID
      const products = await ProductModel.find({
        prodCategory: category._id,
        product: null,
      }).select(
        "_id title slug prodCategory disableLinking featuredImg description"
      );

      const productData = {
        siteUrl: masterHelper.siteUrl(),
        products,
        category,
      };

      //Cache the fetched data
      cache.set(cacheKey, productData);
      res.status(200).json(productData);
    }

    // Check if data is cached
    const cachedData = cache.get("productCatData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    // Run independent queries in parallel
    const [getCategoryIds] = await Promise.all([
      ProductModel.distinct("prodCategory"),
    ]);

    // Fetch category data
    const getCategoryData = await CategoryModel.find({
      _id: { $in: getCategoryIds },
    });

    const prodCategoryData = {
      siteUrl: masterHelper.siteUrl(),
      categoryData: getCategoryData,
    };

    // Cache the fetched data
    cache.set("prodCategory", prodCategoryData);

    res.status(200).json(prodCategoryData);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Something went wrong." });
  }
};

exports.getAnnualReport = async (req, res, next) => {
  try {
    const cachedData = cache.get("annualReportData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const allReports = await AnnualReportModel.find().sort({ _id: -1 });

    const uniqueCategories = await AnnualReportModel.aggregate([
      { $group: { _id: "$category" } },
      { $project: { _id: 0, category: "$_id" } }
    ]);

    const reportDataByCategory = await Promise.all(uniqueCategories.map(async (category) => {
      const getData = await AnnualReportModel.find({ category: category.category });
      return { category: category.category, data: getData };
    }));

    // Cache the fetched data
    const annualReportData = {
      siteUrl: masterHelper.siteUrl(),
      reports: allReports,
      reportDataByCategory: reportDataByCategory
    };

    cache.set("annualReportData", annualReportData);
    res.status(200).json(annualReportData);

  } catch (err) {
    console.error("Error retrieving annual reports:", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getVideos = async (req, res, next) => {
  try {
    
    const cachedData = cache.get("videoData");
    if (cachedData) {
      return res.status(200).json(cachedData); // Return cached data if available
    }

    const allVideos = await VideoModel.find().sort({ _id: -1 });

    const uniqueCategories = await VideoModel.aggregate([
      { $group: { _id: "$category" } },
      { $project: { _id: 0, category: "$_id" } }
    ]);

    const videoDataByCategory = await Promise.all(uniqueCategories.map(async (category) => {
      const getData = await VideoModel.find({ category: category.category });
      return { category: category.category, data: getData };
    }));

    // Cache the fetched data
    const videoData = {
      siteUrl: masterHelper.siteUrl(),
      videos: allVideos,
      videoDataByCategory: videoDataByCategory
    };

    cache.set("videoData", videoData);
    res.status(200).json(videoData);

  } catch (err) {
    console.error("Error retrieving video data:", err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
