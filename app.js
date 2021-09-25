const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const setCorsHeaders = require("./middlewares/cors-headers");
const fileParser = require("./middlewares/file-parser");
const errorHandler = require("./middlewares/error-handler");

const socket = require("./socket");
const telegramBot = require("./bot");

const { DB_URI } = require("./helpers/const");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json <fetch>
app.use(fileParser); // FormData with files
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(setCorsHeaders);

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use(errorHandler);

mongoose
  .connect(DB_URI)
  .then(() => {
    const server = app.listen(8080);
    const io = socket.init(server);
    io.on("connection", (socket) => {
      console.log(`Client connected!`);
    });

    telegramBot.init();
  })
  .catch((err) => console.error(err));
