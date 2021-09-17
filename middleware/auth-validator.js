const { body } = require("express-validator");

const User = require("../models/user");

exports.postLogin = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .normalizeEmail(),
  body("password", "Password has to be valid!").isLength({ min: 6 }),
];

exports.postSignup = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address!")
    .custom((value, meta) =>
      User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("User with entered email is already exists!");
        }
      })
    )
    .normalizeEmail(),
  body(
    "password",
    "Please enter a password with at least 6 charecters long"
  ).isLength({ min: 6 }),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }

    return true;
  }),
];
