const { body, check, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const FaqModel = require("../../models/faq_model");
const csrfHelper = require("../../helpers/csrf");
const masterHelper = require("../../helpers/master_helper");

const isCsrfValid = (value) => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.faq = (req, res, next) => {
  FaqModel.find()
    .sort({ _id: -1 })
    .then((faqData) => {
      res.render("admin/faq/main", {
        title: masterHelper.siteTitle("FAQ"),
        currentMenu: "faq",
        subMenu: "",
        userData: req.session.user,
        faqData: faqData,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.addFaq = (req, res, next) => {
  res.render("admin/faq/add", {
    title: masterHelper.siteTitle("Add FAQ"),
    currentMenu: "faq",
    subMenu: "faq-add",
    userData: req.session.user,
  });
};

exports.editFaq = (req, res, next) => {
  const faqId = req.params.id;

  FaqModel.findOne({ _id: faqId })
    .then((result) => {
      if (!result) {
        return res.redirect("/admin/faq");
      }

      res.render("admin/faq/edit", {
        title: masterHelper.siteTitle("Edit FAQ"),
        currentMenu: "faq",
        subMenu: "faq-edit",
        userData: req.session.user,
        faqData: result,        
      });
    })
    .catch((err) => {
      console.log(err);
      return res.redirect("/admin/faq");
    });
};

const validation = [
  body("title").notEmpty().trim().withMessage("The title field is required."),
  body("description").optional({ nullable: true, checkFalsy: true }),
  body("_csrf").custom(isCsrfValid),
];

exports.doAddFaq = [
  validation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const data = {
      title: req.body.title,
      description: req.body.description,      
    };

    //save the data
    const newFaq = new FaqModel(data);
    newFaq
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
          .json({ msg: "Faq has been created successfully." });
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

exports.doUpdateFaq = [
  updateValidation,
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), eType: "field" });
    }

    const faqId = req.body._id;

    //check if id exist
    FaqModel.findOne({ _id: faqId })
      .then((getFaq) => {
        if (!getFaq) {
          console.log(getFaq);
          return res
            .status(400)
            .json({ msg: "Unable to find faq data", eType: "final" });
        }

        getFaq.title = req.body.title;
        getFaq.description = req.body.description;
        return getFaq.save();
      })
      .then((result) => {
        if (!result) {
          return res
            .status(400)
            .json({ msg: "Something went wrong.", eType: "final" });
        }
        return res
          .status(200)
          .json({ msg: "FAQ has been updated sucessfully." });
      })
      .catch((err) => {
        console.log(err);
        return res
          .status(400)
          .json({ msg: "Unable to find faq data", eType: "final" });
      });
  },
];

const validateBefDelete = [
  body("_csrf").custom(isCsrfValid),
  body("id").notEmpty().trim().withMessage("The faq id is required."),
];

exports.doDeleteFaq = [
  validateBefDelete,
  (req, res, next) => {
    const faqId = req.body.id;

    FaqModel.findOne({ _id: faqId })
      .then((faq) => {
        if (!faq) {
          return res
            .status(400)
            .json({ msg: "Unable to find faq.", eType: "final" });
        }

        return FaqModel.findByIdAndDelete(faqId);
      })
      .then((isDel) => {
        if (isDel) {
          return res.status(200).json({ msg: "FAQ has been deleted" });
        } else {
          return res
            .status(400)
            .json({ msg: "FAQ not found.", eType: "final" });
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
