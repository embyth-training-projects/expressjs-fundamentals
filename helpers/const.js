const dotenv = require("dotenv");

dotenv.config();

module.exports.DB_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.jidn5.mongodb.net/shop-mongoose`;

module.exports.COOKIE_SECRET = process.env.COOKIE_SECRET;

module.exports.SENDGRID_API_KEY = process.env.SEND_GRID_API_KEY;
