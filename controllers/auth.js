const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const { SENDGRID_API_KEY } = require("../helpers/const");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: SENDGRID_API_KEY,
    },
  })
);

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
        .then(() => res.redirect("/login"))
        .then(() =>
          transporter.sendMail({
            to: email,
            from: "Shop NodeJs Course thresh1337@gmail.com",
            subject: "Signup succeeded!",
            html: "<h1>You successfully signed up!</h1>",
          })
        );
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

exports.getReset = (req, res, next) => {
  const messages = req.flash("error"); // array of error messages
  const message = messages.length > 0 ? messages[0] : null;

  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Password reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email found!");
          return res.redirect("/reset");
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 60 * 60 * 1000;
        return user.save().then(() => {
          res.redirect("/");
          transporter.sendMail({
            to: req.body.email,
            from: "Shop NodeJs Course thresh1337@gmail.com",
            subject: "Password reset",
            html: `
            <p>You requested a password reset!</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set new password!</p>
          `,
          });
        });
      })
      .catch((err) => console.error(err));
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid request token!");
        return res.redirect("/reset");
      }

      const messages = req.flash("error"); // array of error messages
      const message = messages.length > 0 ? messages[0] : null;

      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.error(err));
};

exports.postNewPassword = (req, res, next) => {
  const { password, userId, passwordToken } = req.body;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .catch((err) => console.error(err));
    })
    .then(() => res.redirect("/login"))
    .catch((err) => console.error(err));
};
