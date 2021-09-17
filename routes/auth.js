const express = require("express");

const authController = require("../controllers/auth");

const authValidators = require("../middleware/auth-validator");

const router = express.Router();

router.get("/login", authController.getLogin);

router.post("/login", authValidators.postLogin, authController.postLogin);

router.get("/signup", authController.getSignup);

router.post("/signup", authValidators.postSignup, authController.postSignup);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
