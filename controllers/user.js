const User = require("../models/user");

exports.getDummyUser = (req, res, next) => {
  User.findById("613f8ccc7a8c3218f9322292")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.error(err));
};
