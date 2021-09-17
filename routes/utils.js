const express = require("express");

const errorController = require("../controllers/error");

const router = express.Router();

router.get("/500", errorController.getServerError);

router.get(errorController.getNotFound);

module.exports = router;
