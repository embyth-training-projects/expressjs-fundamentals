const { body } = require("express-validator");

const User = require("../models/user");

module.exports.signupData = [
  body("email")
    .isEmail()
    .withMessage("Please enter valid email!")
    .custom((value, { req }) =>
      User.findOne({ email: value }).then((user) => {
        if (user) {
          return Promise.reject(
            "User with entered E-Mail address already exists!"
          );
        }
      })
    )
    .normalizeEmail(),
  body("password").trim().isLength({ min: 5 }),
  body("name").trim().not().isEmpty(),
];

module.exports.loginData = [
  body("email")
    .isEmail()
    .withMessage("Please enter valid email!")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 5 })
    .withMessage("Password has to be valid!"),
];

module.exports.statusData = [body("status").trim().not().isEmpty()];
