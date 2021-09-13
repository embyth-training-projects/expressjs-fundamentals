const { ObjectId } = require("mongodb");

const { getDatabase } = require("../helpers/database");

class Product {
  constructor(title, price, description, imageUrl) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
  }

  save() {
    const db = getDatabase();

    return db.collection("products").insertOne(this);
  }

  update(productId) {
    const db = getDatabase();

    return db
      .collection("products")
      .updateOne({ _id: new ObjectId(productId) }, { $set: this });
  }

  static fetchAll() {
    const db = getDatabase();

    return db.collection("products").find().toArray();
  }

  static findById(productId) {
    const db = getDatabase();

    return db.collection("products").findOne({ _id: new ObjectId(productId) });
  }

  static deleteById(productId) {
    const db = getDatabase();

    return db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) });
  }
}

module.exports = Product;
