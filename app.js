const path = require("path");

const express = require("express");
const session = require("express-session");
const MongoDBStrore = require("connect-mongodb-session")(session);
const bodyParser = require("body-parser");

const mongooseConnect = require("./helpers/database");
const { DB_URI, COOKIE_SECRET } = require("./helpers/const");

const userController = require("./controllers/user");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const utilityRoutes = require("./routes/utils");

const app = express();

const sessionStore = new MongoDBStrore({ uri: DB_URI, collection: "sessions" });
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(userController.getDummyUser);

app.use(shopRoutes);
app.use("/admin", adminRoutes);
app.use(authRoutes);
app.use(utilityRoutes);

mongooseConnect(DB_URI)
  .then(() => app.listen(3000))
  .catch((err) => console.error(err));
