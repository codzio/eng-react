const { body, validationResult } = require('express-validator');
const csrf = require('../../helpers/csrf');

exports.login = (req, res, next) => {
  res.render("admin/login", {
    title: "Login",
  });
};

exports.doAuth = [

  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  (req, res, next) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array(), 'eType': 'field' });
    }

    const csrfToken = req.body._csrf

    if (!csrf.verifyCsrf(csrfToken)) {
      return res.status(403).json({
        eType: "final",
        msg: "You don't have permission to access this resource."
      });
    }

    return res.status(200).json({msg: 'Proceed'});

  }

];
