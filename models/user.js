const { ObjectId } = require("mongodb");

const { getDatabase } = require("../helpers/database");

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this._id = id; // will be ObjectId
  }

  save() {
    const db = getDatabase();

    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const db = getDatabase();

    const cartProductIdx = this.cart.items.findIndex(
      (cartProduct) =>
        cartProduct.productId.toString() === product._id.toString()
    );

    if (cartProductIdx === -1) {
      // Add new cart item
      this.cart.items = [
        ...this.cart.items,
        { productId: new ObjectId(product._id), quantity: 1 },
      ];
    } else {
      // Update quantity of existing one
      this.cart.items[cartProductIdx].quantity =
        this.cart.items[cartProductIdx].quantity + 1;
    }

    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: this.cart } });
  }

  getCart() {
    const db = getDatabase();
    const productsIds = this.cart.items.map((item) => item.productId);

    return db
      .collection("products")
      .find({ _id: { $in: productsIds } })
      .toArray()
      .then((products) =>
        products.map((product) => ({
          ...product,
          quantity: this.cart.items.find(
            (item) => item.productId.toString() === product._id.toString()
          ).quantity,
        }))
      );
  }

  deleteCartItemById(productId) {
    const db = getDatabase();

    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );

    return db
      .collection("users")
      .updateOne(
        { _id: this._id },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDatabase();

    return this.getCart()
      .then((products) =>
        db.collection("orders").insertOne({
          items: products,
          user: { _id: this._id, name: this.name },
        })
      )
      .then(() => (this.cart = { items: [] }))
      .then(() =>
        db
          .collection("users")
          .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
      );
  }

  getOrders() {
    const db = getDatabase();

    return db.collection("orders").find({ "user._id": this._id }).toArray();
  }

  static findById(userId) {
    const db = getDatabase();

    return db.collection("users").findOne({ _id: new ObjectId(userId) });
  }
}

module.exports = User;
