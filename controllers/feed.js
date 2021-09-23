const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

const socket = require("../socket");

const { deleteImage } = require("../helpers/utils");
const { POSTS_PER_PAGE } = require("../helpers/const");

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;

  let totalItems;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return Post.find()
        .populate("creator")
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * POSTS_PER_PAGE)
        .limit(POSTS_PER_PAGE);
    })
    .then((posts) =>
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts,
        totalItems,
      })
    )
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect!");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided!");
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  const imageUrl = req.file.path.replace(/\\/g, "/");
  let creatorId = req.userId;
  let creatorName;

  const post = new Post({ title, content, imageUrl, creator: creatorId });

  post
    .save()
    .then(() => User.findById(creatorId))
    .then((user) => {
      creatorId = user._id;
      creatorName = user.name;
      user.posts.push(post);
      return user.save();
    })
    .then(() => {
      const io = socket.getIO();
      io.emit("posts", {
        action: "create",
        post: { ...post._doc, creator: { _id: creatorId, name: creatorName } },
      });
    })
    .then(() =>
      res.status(201).json({
        message: "Post created successfully!",
        post: {
          ...post._doc,
          creator: { _id: creatorId, name: creatorName },
        },
      })
    )
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 422;
        throw error;
      }

      res.status(200).json({ message: "Post fetched!", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect!");
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;
  const image = req.file;
  let imageUrl;

  if (image) {
    imageUrl = image.path.replace(/\\/g, "/");
  }

  Post.findById(postId)
    .populate("creator")
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 422;
        throw error;
      }

      if (post.creator._id.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      if (image) {
        deleteImage(post.imageUrl);
        post.imageUrl = imageUrl;
      }

      post.title = title;
      post.content = content;

      return post.save();
    })
    .then((post) => {
      const io = socket.getIO();
      io.emit("posts", {
        action: "update",
        post,
      });
      return post;
    })
    .then((post) =>
      res.status(200).json({
        message: "Post updated successfully!",
        post,
      })
    )
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post!");
        error.statusCode = 422;
        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;
        throw error;
      }

      deleteImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(() => User.findById(req.userId))
    .then((user) => {
      user.posts.pull(postId);
      return user.save();
    })
    .then(() => {
      const io = socket.getIO();
      io.emit("posts", {
        action: "delete",
        post: postId,
      });
    })
    .then(() => res.status(200).json({ message: "Post deleted successfully!" }))
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
