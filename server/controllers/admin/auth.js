const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const { ObjectId } = require('mongodb');
const fs = require("fs");
const path = require("path")
const UserModel = require('../../models/user_model');

const BannerModel = require('../../models/banner_model');
const PageModel = require('../../models/page_model');
const ClientModel = require('../../models/client_model');
const CertificateModel = require('../../models/certificate_model');
const TestimonialModel = require('../../models/testimonial_model');
const FaqModel = require('../../models/faq_model');
const EventModel = require('../../models/event_model');
const WhyModel = require('../../models/why_model');
const BlogCategoryModel = require('../../models/category_model');
const BlogModel = require('../../models/blog_model');
const UseCasesModel = require('../../models/use_cases_model');
const ProductCategoryModel = require('../../models/product_category_model');
const ProductFeaturesModel = require('../../models/product_features_model');
const ProductModel = require('../../models/product_model');
const CareerModel = require('../../models/career_model');
const ContactModel = require('../../models/contact_model');

const csrfHelper = require('../../helpers/csrf');
const masterHelper = require('../../helpers/master_helper');

const isCsrfValid = value => {
  if (!csrfHelper.verifyCsrf(value)) {
    throw new Error("You don't have permission to access this resource.");
  }
  return true;
};

exports.login = (req, res, next) => {
  
  //check if session set
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }

  res.render("admin/login", {
    title: "Login",
    siteUrl: masterHelper.siteUrl()
  });

};

exports.dashboard = async (req, res, next) => {

  const totalBanners = await BannerModel.find().count();
  const totalPages = await PageModel.find().count();
  const totalClient = await ClientModel.find().count();

  const totalCertificate = await CertificateModel.find().count();
  const totalTestimonials = await TestimonialModel.find().count();
  const totalFaq = await FaqModel.find().count();
  const totalEvent = await EventModel.find().count();
  const totalWhy = await WhyModel.find().count();
  const totalBlogCategory = await BlogCategoryModel.find().count();
  const totalBlogs = await BlogModel.find().count();
  const totalUseCases = await UseCasesModel.find().count();
  const totalProductCategory = await ProductCategoryModel.find().count();
  const totalProductFeatures = await ProductFeaturesModel.find().count();
  const totalProduct = await ProductModel.find().count();
  const totalCareer = await CareerModel.find().count();
  const totalContact = await ContactModel.find().count();

  res.render("admin/dashboard", {
    title: masterHelper.siteTitle('Dashboard'),
    currentMenu: 'dashboard',
    subMenu: '',
    userData: req.session.user,
    count: {
      banner: totalBanners,
      page: totalPages,
      client: totalClient,
      certificate: totalCertificate,
      testimonials: totalTestimonials,
      faq: totalFaq,
      event: totalEvent,
      why: totalWhy,
      blogCat: totalBlogCategory,
      blogs: totalBlogs,
      useCases: totalUseCases,
      prodCategory: totalProductCategory,
      prodFeatures: totalProductFeatures,
      product: totalProduct,
      career: totalCareer,
      contact: totalContact,
    }
  });
}

exports.accountSettings = (req, res, next) => {

  const userId = req.session.user.userId;

  UserModel.findById(userId).then(user => {

    if (!user) {
      return res.redirect('/admin/dashboard');
    }

    let profileImg = "../media/blank.svg";

    if (user.profileImg) {
      profileImg = masterHelper.siteUrl() + user.profileImg;
    }

    res.render("admin/account_settings", {
      title: masterHelper.siteTitle('Account Settings'),
      currentMenu: 'account-settings',
      subMenu: '',
      userData: req.session.user,
      data: user,
      profileImg: profileImg
    });

  }).catch(err => {
    console.log(err);
    return res.redirect('/admin/dashboard');
  })
  
}

exports.doAuth = (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const email = req.body.email;
    const password = req.body.password;

    //check if user exists in the database

    UserModel.findOne({email: email}).then((user) => {
      
      if (!user) {
        return res.status(400).json({msg: 'Email or password may be incorrect.', 'eType': 'final'});
      } else {
        
        //validate password
        bcrypt.compare(password, user.password).then((doMatch) => {

            if (!doMatch) {
              return res.status(400).json({msg: 'Email or password may be incorrect.', 'eType': 'final'});
            }

            //check account status

            if (!user.isActive) {
              return res.status(400).json({msg: 'Your account has been inactive.', 'eType': 'final'}); 
            }

            //if matched then create a session
            req.session.user = {
              userId: user._id,
              name: user.name,
              email: user.email
            }

            return res.status(200).json({msg: 'You have sucessfully logged in', redirectUrl: "admin/dashboard"});

        }).catch((err) => {
          return res.status(400).json({msg: 'Email or password may be incorrect.', 'eType': 'final'});
        });

      }

    }).catch((err) => {
      return res.status(400).json({msg: 'Email or password may be incorrect.', 'eType': 'final'});
    })

}

exports.doUpdateProfile = (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const userId = req.session.user.userId;
    const updatedName = req.body.name;
    const updatedPhone = (req.body.phone)? req.body.phone:null;
    const updatedAddress = (req.body.address)? req.body.address:null;
    const removeProfileImg = req.body.profileImg_remove;    

    UserModel.findById(userId)
    .then((userData) => {
      
      userData.name = updatedName;
      userData.phone = updatedPhone;
      userData.address = updatedAddress;     
      
      if (req.file) {
        userData.profileImg = req.file.path; 
      } else if(removeProfileImg) {

        if (userData.profileImg) {
          fs.unlink(path.join(__dirname, '../../', userData.profileImg), (err) => {
            console.log(err);
          });
        }
        
        userData.profileImg = null;
      }
      
      req.session.user.name = updatedName;
      return userData.save();

    }).then(result => {
        return res.status(200).json({msg: 'Profile has been sucessfully updated.'});
    })
    .catch(err => {
      return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
    }) 
}

exports.doUpdateEmail = (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const userId = req.session.user.userId;
    const emailAddress = req.body.emailAddress;
    const password = req.body.confirmEmailPassword;    

    UserModel.findOne({ email: emailAddress, _id: { $ne: userId } })
    .then((isEmailExist) => {

      //check if email exist
      if (isEmailExist) {
        return res.status(400).json({msg: 'The email address is already in used.', 'eType': 'final'});
      }

      //check the password
      return UserModel.findOne({_id: userId});

    }).then((userData) => {

        if (!userData) {
            return res.status(400).json({msg: 'Something went wrong.', 'eType': 'final'});
        }

        //check password
        return bcrypt.compare(password, userData.password)

    }).then((passwordMatch) => {
          
      if (!passwordMatch) {
        return res.status(400).json({msg: 'The entered password is incorrect.', 'eType': 'final'});
      }

      req.session.user.email = emailAddress;
      return UserModel.findByIdAndUpdate(userId, { email: emailAddress });

    })
    .then(() => {
      // Successfully updated email
      res.status(200).json({msg: 'The email address has been updated sucessfully.'});
    })
    .catch(err => {

      console.log(err);
      if (!res.headersSent) {
        // Send an error response if headers have not been sent yet
        res.status(400).json({msg: 'The email address is already in used.', 'eType': 'final'});
      }

    })
}

exports.doChangePass = (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }    

    const userId = req.session.user.userId;
    const currentPassword = req.body.currentpassword;
    const newPassword = req.body.newpassword;

    UserModel.findById({ _id: userId})
    .then((user) => {

      //check if email exist
      if (!user) {
        return res.status(400).json({msg: 'Unable to find the user', 'eType': 'final'});
      }

      // Verify the current password
      return bcrypt.compare(currentPassword, user.password);

    })
    .then((passwordMatch) => {
        if (!passwordMatch) {
          return res.status(400).json({msg: 'The current password is not matched.', 'eType': 'final'});
        }

        // Hash the new password
        return bcrypt.hash(newPassword, 10);

    })
    .then((hashedNewPassword) => {
      // Update the user's password
      return UserModel.findByIdAndUpdate({ _id: userId}, { password: hashedNewPassword });
    })
    .then(() => {
      // Successfully updated password
      res.status(200).json({msg: 'The password has been changed sucessfully.'});
    })
    .catch((error) => {
        // Handle any errors that occurred during the process
      console.error('Error updating password:', error);
      if (!res.headersSent) {
        // Send an error response if headers have not been sent yet
        res.status(500).json({msg: 'Internal servor error.', 'eType': 'final'});
      }
    });
}

exports.doLogout = (req, res, next) => {
  //check if session set
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Server error');
    } else {
      return res.redirect('/admin');
    }
  });

}