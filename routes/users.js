const router = require("express").Router();

const users = [];

router.get("/users", (req, res, next) => {
  res.render("users", { users, pageTitle: `Users` });
});

router.post("/add-user", (req, res, next) => {
  users.push({ name: req.body.username });
  res.redirect("/users");
});

module.exports = router;
