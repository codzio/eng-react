const path = require("path");
const { body, check, validationResult } = require('express-validator');
const multer = require('multer');
const fs = require("fs");
const fsPromisse = require("fs").promises;
const nodemailer = require('nodemailer');

const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");
const BannerModel = require("../../models/banner_model");
const UseCasesModel = require('../../models/use_cases_model');
const WhyModel = require("../../models/why_model");
const ProductModel = require("../../models/product_model");
const TestimonialModel = require("../../models/testimonial_model");
const ClientModel = require("../../models/client_model");
const PageModel = require("../../models/page_model");
const EventModel = require("../../models/event_model");
const CertificateModel = require("../../models/certificate_model");
const ContactModel = require("../../models/contact_model");
const CareerModel = require("../../models/career_model");
const SiteSettingModel = require('../../models/site_settings_model');
const CategoryModel = require('../../models/product_category_model');
const ProjectModel = require('../../models/project_model');

exports.getHomePage = async (req, res, next) => {
  try {

    const getBanners = await BannerModel.find().sort({ _id: -1 });
    
    const getUseCases = await UseCasesModel.find({homepage: true})
    .sort({ _id: -1 }).populate('services').exec();

    // const whyEAndE = await WhyModel.find().sort({ _id: -1 });
    const whyEAndE = await WhyModel.find();

    const products = await ProductModel.find({homepage: true})
    .sort({ _id: -1 }).limit(10);

    const testimonials = await TestimonialModel.find().sort({ _id: -1 });

    // const clients = await ClientModel.find().sort({ _id: -1 });
    const clients = await ClientModel.find();

    const getCategoryIds = await ProductModel.distinct('prodCategory').exec();
    const getCategoryData = await CategoryModel.find({ _id: { $in: getCategoryIds } });

    const newData = [];

    for (const categoryData of getCategoryData) {
      // Get products having the category id
      const getCategoryProducts = await ProductModel.findOne({ prodCategory: categoryData._id, product: null })
        .select('_id title slug prodCategory')
        .exec();

      newData.push({
        category: categoryData.toObject(),
        product: getCategoryProducts.toObject()
      });
    }

    const getPage = await PageModel.find({slug: 'home'});

    const projects = await ProjectModel.find({homepage: true})
    .sort({ _id: -1 });

    res.status(200).json({
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
      home: getPage
    });

  } catch(err) {
    console.log(err);
    return res.status(400).json({msg: 'Something went wrong.'});
  }
}

exports.getComman = async (req, res, next) => {
  try {

    const getSettings = await SiteSettingModel.find().sort({ _id: -1 });

    const getCategoryIds = await ProductModel.distinct('prodCategory').exec();
    const getCategoryData = await CategoryModel.find({ _id: { $in: getCategoryIds } });

    const newData = [];

    for (const categoryData of getCategoryData) {
      // Get products having the category id
      const getCategoryProducts = await ProductModel.find({ prodCategory: categoryData._id, product: null })
        .select('_id title slug prodCategory disableLinking')
        .exec();

      const createProductAndSubProduct = [];

      for (const subProduct of getCategoryProducts) {
        const subProductObject = { ...subProduct.toObject(), subProduct: [] };

        const getSubProducts = await ProductModel.find({ product: subProduct._id })
          .select('_id title slug prodCategory disableLinking')
          .exec();

        if (getSubProducts.length > 0) {
          subProductObject.subProduct = getSubProducts;
        }

        createProductAndSubProduct.push(subProductObject);
      }

      newData.push({
        category: categoryData.toObject(),
        product: createProductAndSubProduct
      });
    }
    

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      common: getSettings,
      //prodCat: getCategoryData,
      newData: newData
    });

  } catch(err) {
    console.log(err);
    return res.status(400).json({msg: 'Something went wrong.'});
  }
}

exports.getPageData = async (req, res, next) => {
  try {

    const pageSlug = req.params.slug;
    const page = await PageModel.find({slug: pageSlug})   

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      page: page,
    });

  } catch(err) {
    console.log(err);
    return res.status(400).json({msg: 'Something went wrong.'});
  }
}

exports.getProjectData = async (req, res, next) => {
  try {

    const slug = req.params.slug;
    const project = await ProjectModel.find({slug: slug}).populate('products').exec();   

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      project: project,
    });

  } catch(err) {
    console.log(err);
    return res.status(400).json({msg: 'Something went wrong.'});
  }
}

exports.getGalleryData = async (req, res, next) => {
  try {

    const getEvents = await EventModel.find().sort({ _id: -1 });
    const getCertificate = await CertificateModel.find().sort({ _id: -1 });
    const getGalleryPageData = await PageModel.find({slug: 'gallery'});  

    res.status(200).json({
      siteUrl: masterHelper.siteUrl(),
      events: getEvents,
      certificate: getCertificate,
      galleryPageData: getGalleryPageData
    });

  } catch(err) {
    console.log(err);
    return res.status(400).json({msg: 'Something went wrong.'});
  }
}

exports.getContactData = async (req, res, next) => {

}

const contactValidation = [
  body('name').notEmpty().trim().withMessage('The name is required.'),
  body('email').trim().isEmail().withMessage('The email is invalid'),
  body('phoneNumber').notEmpty().trim().withMessage('The phone number is required'),
  body('subject').optional({ nullable: true, checkFalsy: true }),
  body('message').optional({ nullable: true, checkFalsy: true }), 
];

exports.postContact = [  
  contactValidation, 
  (req, res, next) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const data = {
      name: req.body.name,
      email: req.body.email,
      phone_number: req.body.phoneNumber,
      subject: req.body.subject,
      message: req.body.message,
    }

    //save the data
    const newContact = new ContactModel(data);
    newContact.save().then((result) => {

      if (!result) {
        console.log(result);
        return res.status(400).json({msg: 'Something went wrong', 'eType': 'final'});
      }

      // Create a transporter object using SMTP
      const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com', // Your SMTP server host
          port: 465, // Your SMTP server port
          secure: true, // Set to true if your SMTP server uses SSL/TLS
          auth: {
              user: 'alfaizm19@gmail.com',
              pass: 'oyvi ygcl iipl bpld'
          }
      });

      const mailOptions = {
        from: 'Enggenvsolutions <alfaizm19@gmail.com>', // Sender name and address
        to: 'enggenvsolution@gmail.com', // Recipient address
        subject: 'Contact Form Submission', // Email subject
        html: `
            <p><strong>Contact details:</strong></p>
            <p><strong>Name:</strong> ${req.body.name}</p>
            <p><strong>Contact Number:</strong> ${req.body.phoneNumber}</p>
            <p><strong>Email:</strong> ${req.body.email}</p>
            <p><strong>Subject:</strong> ${req.body.subject}</p>
            <p><strong>Message:</strong> ${req.body.message}</p>
        `
      };

      // Send the email
      transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
              console.log('Error sending email:', error);
              return res
              .status(400)
              .json({
                msg: "Something went wrong.",
                eType: "final",
              });
          } else {
              console.log('Email sent:', info.response);
              return res
              .status(200)
              .json({ msg: "Thank you. Our team will contact your shortly." });
          }
      });

      //return res.status(200).json({msg: 'Thank you for contact us.'});

    }).catch((err) => {
      console.log(err);
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    })
    
  }
];

// Career
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    
    let destination = 'uploads/career/';
    cb(null, destination);

  },
  filename: (req, file, cb) => {
    cb(null, 
      masterHelper.slugify(path.parse(file.originalname).name) + '-' +
      Date.now() +
      path.extname(file.originalname)
    );
  }
});

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only doc,docx and pdf files are allowed'), false);
  } else {
    cb(null, true);
  }

};

const maxSize = 1.5 * 1024 * 1024; // 1.5MB maximum file size

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: maxSize // Set maximum file size
  }
});

const validateResume = [
  check("resume").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The resume is required");
    }

    if (req.file) {
      // Check file type (accept png, jpeg, jpg)
      const allowedMimeTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];;
      if (!allowedMimeTypes.includes(req.file.mimetype)) {
        throw new Error(
          "Invalid file type. Please upload doc, docx and pdf"
        );
      }

      // Check file size (max 1.5 MB)
      const maxSize = 1.5 * 1024 * 1024; // 1.5 in MB
      if (req.file.size > maxSize) {
        throw new Error("File size exceeds the limit of 1.5 MB");
      }
    }

    return true;
  }),
];


const validation = [
  body("profile").notEmpty().trim().withMessage("The profile field is required."),
  body('firstName').notEmpty().trim().withMessage('The first name is required.'),
  body('lastName').notEmpty().trim().withMessage('The last name is required.'),
  body('email').trim().isEmail().withMessage('The email is invalid'),
  body('phoneNumber').optional({ nullable: true, checkFalsy: true })
  .isNumeric().withMessage('The phone number must be numeric.')
  .isLength({ min: 10, max: 15 }).withMessage('The phone number must be 10 digit long.'),
  body("message").optional({ nullable: true, checkFalsy: true }),
];

exports.postCareer = [
  upload.single("resume"),
  validateResume,
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      profile: req.body.profile,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      contact: req.body.phoneNumber,
      message: req.body.message,
      resume: req.file.path,
    }

    //save the data
    const newCareer = new CareerModel(data);
    newCareer
      .save()
      .then((result) => {
        if (!result) {
          console.log(result);
          return res
            .status(400)
            .json({
              msg: "Something went wrong.",
              eType: "final",
            });
        }

        // Create a transporter object using SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', // Your SMTP server host
            port: 465, // Your SMTP server port
            secure: true, // Set to true if your SMTP server uses SSL/TLS
            auth: {
                user: 'alfaizm19@gmail.com',
                pass: 'oyvi ygcl iipl bpld'
            }
        });

        const mailOptions = {
          from: 'Enggenvsolutions <alfaizm19@gmail.com>', // Sender name and address
          to: 'hr@enggenv.com', // Recipient address
          subject: 'Career Form Submission', // Email subject
          html: `
              <p><strong>Career details:</strong></p>
              <p><strong>Department:</strong> ${req.body.profile}</p>
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

        // Send the email
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log('Error sending email:', error);
                return res
                .status(400)
                .json({
                  msg: "Something went wrong.",
                  eType: "final",
                });
            } else {
                console.log('Email sent:', info.response);
                return res
                .status(200)
                .json({ msg: "Thank you for sharing your CV with us." });
            }
        });

        // return res
        //   .status(200)
        //   .json({ msg: "Thank you for sharing your CV with us." });


      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Something went wrong.", eType: "final" });
      });
  },
];

const enquiryValidation = [
  body("organizationName").notEmpty().trim().withMessage("The organization name is required."),
  body('firstName').notEmpty().trim().withMessage('The first name is required.'),
  body('lastName').notEmpty().trim().withMessage('The last name is required.'),
  body('designation').notEmpty().trim().withMessage('The designation is required.'),
  body('phoneNumber')
    .notEmpty().withMessage('The phone number is required')
    .isNumeric().withMessage('The phone number must be numeric'),
  body('email')
    .notEmpty().withMessage('The email is required')
    .trim()
    .isEmail().withMessage('The email is invalid'),
  body('city').notEmpty().trim().withMessage('The city is required.'),
  body('country').notEmpty().trim().withMessage('The country is required.'),
  body('product').notEmpty().trim().withMessage('The product is required.'),
  body('potentialAssociation').notEmpty().trim().withMessage('The potential association is required.'),
  body('productPage').notEmpty().trim().withMessage('The product page is required.'),
  body("message").optional({ nullable: true, checkFalsy: true }),
];

exports.postEnquiry = [    
  enquiryValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Your SMTP server host
        port: 465, // Your SMTP server port
        secure: true, // Set to true if your SMTP server uses SSL/TLS
        auth: {
            user: 'alfaizm19@gmail.com',
            pass: 'oyvi ygcl iipl bpld'
        }
    });

    const mailOptions = {
      from: 'Enggenvsolutions <alfaizm19@gmail.com>', // Sender name and address
      to: 'enggenvsolution@gmail.com', // Recipient address
      subject: 'Enquiry Form Submission', // Email subject
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
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log('Error sending email:', error);
            return res
            .status(400)
            .json({
              msg: "Something went wrong.",
              eType: "final",
            });
        } else {
            console.log('Email sent:', info.response);
            return res
            .status(200)
            .json({ msg: "Thank you. Our team will contact your shortly." });
        }
    });

  },
];