const User = require("../models/user");

exports.getDummyUser = (req, res, next) => {
  User.findById("613f5b492634ee7e145cff1c")
    .then(({ _id, name, email, cart }) => {
      req.user = new User(name, email, cart, _id);
      next();
    })
    .catch((err) => console.error(err));
};
