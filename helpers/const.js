const dotenv = require("dotenv");

dotenv.config();

module.exports.DB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jidn5.mongodb.net/${process.env.DB_NAME}`;

module.exports.JWT_SECRET = process.env.JWT_SECRET;

module.exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

module.exports.POSTS_PER_PAGE = 2;
