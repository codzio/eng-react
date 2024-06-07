const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const UserModel = require('../../models/user_model');
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

exports.dashboard = (req, res, next) => {
  res.render("admin/dashboard", {
    title: masterHelper.siteTitle('Dashboard'),
    currentMenu: req.path,
    userData: req.session.user
  });
}

exports.accountSettings = async (req, res, next) => {

   try {
      
      const userData = await masterHelper.getData(req.session.user.email);

      console.log(userData, 'tesssst');
      
      res.render("admin/account_settings", {
        title: masterHelper.siteTitle('Account Settings'),
        currentMenu: req.path,
        userData: req.session.user
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Server error' });
    }

}

exports.doAuth = [

  body('email').trim().isEmail().withMessage('Invalid email address'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('_csrf').custom(isCsrfValid),

  (req, res, next) => {

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

];

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