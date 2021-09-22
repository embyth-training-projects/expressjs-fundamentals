const express = require("express");

const authController = require("../controllers/auth");

const authValidator = require("../middlewares/auth-validator");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.put("/signup", authValidator.signupData, authController.signup);

router.post("/login", authValidator.loginData, authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  authValidator.statusData,
  authController.updateUserStatus
);

module.exports = router;
