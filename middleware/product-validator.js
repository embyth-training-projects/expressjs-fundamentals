const { body } = require("express-validator");

exports.addProduct = [
  body("title")
    .isString()
    .isLength({ min: 4 })
    .withMessage("Title should be at least 4 charecters long")
    .trim(),
  body("price")
    .isFloat()
    .withMessage("Product price should be a decimal number"),
  body("description")
    .isLength({ min: 10, max: 400 })
    .withMessage(
      "Description should be at least 10 charecters long and 400 charecters max"
    )
    .trim(),
];
