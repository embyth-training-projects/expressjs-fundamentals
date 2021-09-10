const Sequelize = require("sequelize");

const sequelize = new Sequelize("nodejs-course", "root", "admin123", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
