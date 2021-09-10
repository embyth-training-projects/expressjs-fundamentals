const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const userController = require("./controllers/user");

const shopRoutes = require("./routes/shop");
const adminRoutes = require("./routes/admin");
const utilityRoutes = require("./routes/utils");

const sequelize = require("./helpers/database");

const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(userController.getDummyUser);

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(utilityRoutes);

Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({ force: true })
  .sync()
  .then(() => User.findByPk(1))
  .then((user) =>
    !user ? User.create({ name: "Max", email: "test@test.com" }) : user
  )
  .then((user) => user.createCart())
  .then(() => app.listen(3000))
  .catch((err) => console.error(err));
