const express = require("express");
const bodyParser = require("body-parser");

const mainRoutes = require("./routes/main");
const userRoutes = require("./routes/users");

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(mainRoutes);
app.use(userRoutes);

app.listen(3000);
