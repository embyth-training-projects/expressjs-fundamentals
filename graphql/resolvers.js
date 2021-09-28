const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../models/user");
const Post = require("../models/post");
const BotUser = require("../models/bot-user");

const telegramBot = require("../bot");

const { deleteImage } = require("../helpers/utils");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  POSTS_PER_PAGE,
} = require("../helpers/const");

module.exports = {
  signup: async function (args) {
    const { email, password, name } = args.signupData;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: `E-Mail is invalid!` });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Password is too short!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.statusCode = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User exists already!");
      error.statusCode = 401;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, name, password: hashedPassword });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async function ({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("A user with such email could not be found!");
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return { token, userId: user._id.toString() };
  },

  status: async function ({ userId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    return { ...user._doc, _id: user._id.toString() };
  },

  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    user.status = status;
    await user.save();

    return { ...user._doc, _id: user._id.toString() };
  },

  posts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    page = !page ? 1 : page;

    const totalPosts = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((page - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE);

    return {
      posts: posts.map((post) => ({
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      })),
      totalPosts,
    };
  },

  post: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");
    if (!post) {
      const error = new Error("Could not find post!");
      error.statusCode = 422;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },

  deletePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(postId);

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
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);

    await user.save();

    return true;
  },

  createPost: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const { title, content } = args.postData;
    const imageUrl = args.postData.imageUrl.replace(/\\/g, "/");

    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is too short!" });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content is too short!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.statusCode = 422;
      error.data = errors;
      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("User not found!");
      error.statusCode = 404;
      throw error;
    }

    const post = new Post({ title, content, imageUrl, creator: user });

    const createdPost = await post.save();

    const botUsers = await BotUser.find();
    const bot = telegramBot.getBot();
    botUsers.map((botUser) =>
      bot.sendMessage(
        botUser.chatId,
        `New Product has been created!

        Title: ${title}
        Content: ${content}
        Creator: ${user.name}`
      )
    );

    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  updatePost: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.statusCode = 401;
      throw error;
    }

    const { title, content } = args.postData;
    const postId = args.postId;
    const imageUrl = args.postData.imageUrl.replace(/\\/g, "/");

    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Title is too short!" });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Content is too short!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.statusCode = 422;
      error.data = errors;
      throw error;
    }

    const post = await Post.findById(postId).populate("creator");

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

    if (!validator.isEmpty(imageUrl)) {
      post.imageUrl = imageUrl;
    }

    post.title = title;
    post.content = content;
    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
};
