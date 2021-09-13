const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const { mongoConnect } = require("./helpers/database");

const userController = require("./controllers/user");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const utilityRoutes = require("./routes/utils");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(userController.getDummyUser);

app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(utilityRoutes);

mongoConnect(() => app.listen(3000));
