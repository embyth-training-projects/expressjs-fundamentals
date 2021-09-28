const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const setCorsHeaders = require("./middlewares/cors-headers");
const fileParser = require("./middlewares/file-parser");
const errorHandler = require("./middlewares/error-handler");
const isAuth = require("./middlewares/is-auth");
const graphqlServer = require("./middlewares/graphql-server");
const fileHandler = require("./middlewares/file-handler");

const telegramBot = require("./bot");

const { DB_URI } = require("./helpers/const");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json <fetch>
app.use(fileParser); // FormData with files
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(setCorsHeaders);

app.use(isAuth);

app.put("/post-image", fileHandler);

app.use("/graphql", graphqlServer);

app.use(errorHandler);

mongoose
  .connect(DB_URI)
  .then(() => {
    app.listen(8080);
    telegramBot.init();
  })
  .catch((err) => console.error(err));
