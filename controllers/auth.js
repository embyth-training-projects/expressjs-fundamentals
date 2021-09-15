const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  const messages = req.flash("error"); // array of error messages
  const message = messages.length > 0 ? messages[0] : null;

  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password!");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((isPasswordsMatch) => {
          if (isPasswordsMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            return req.session.save((err) => {
              if (err) {
                console.error(err);
              }

              res.redirect("/");
            });
          }

          req.flash("error", "Invalid email or password!");
          res.redirect("/login");
        })
        .catch((err) => console.error(err));
    })
    .catch((err) => console.error(err));
};

exports.getSignup = (req, res, next) => {
  const messages = req.flash("error"); // array of error messages
  const message = messages.length > 0 ? messages[0] : null;

  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "User with entered email is already exists!");
        return res.redirect("/signup");
      }

      if (password !== confirmPassword) {
        req.flash("error", "Password doesnt match confirmed one!");
        return res.redirect("/signup");
      }

      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return user.save();
        })
        .then(() => res.redirect("/login"));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }

    res.redirect("/");
  });
};
