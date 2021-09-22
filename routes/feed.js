const express = require("express");

const feedController = require("../controllers/feed");

const feedValidator = require("../middlewares/feed-validator");
const isAuth = require("../middlewares/is-auth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);

router.post("/post", isAuth, feedValidator.postData, feedController.createPost);

router.get("/posts/:postId", isAuth, feedController.getPost);

router.put(
  "/post/:postId",
  isAuth,
  feedValidator.postData,
  feedController.updatePost
);

router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
