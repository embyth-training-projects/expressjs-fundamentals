const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.render("index", { pageTitle: "Enter user name" });
});

module.exports = router;
