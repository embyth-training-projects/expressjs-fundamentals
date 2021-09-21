const express = require("express");
const bodyParser = require("body-parser");

const setCorsHeaders = require("./middlewares/cors-headers");

const feedRoutes = require("./routes/feed");

const app = express();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(setCorsHeaders);

app.use("/feed", feedRoutes);

app.listen(8080);
