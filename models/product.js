const fs = require("fs");

const { nanoid } = require("nanoid");

const utils = require("../helpers/utils");

const Cart = require("./cart");

const productsPath = utils.getCombinedPath("products.json", "data");

const getProducts = (callback) => {
  fs.readFile(productsPath, (err, fileContent) => {
    if (err) {
      callback([]);
    } else {
      callback(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProducts((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (product) => product.id === this.id
        );

        const updatedProducts = [
          ...products.slice(0, existingProductIndex),
          this,
          ...products.slice(existingProductIndex + 1),
        ];

        fs.writeFile(productsPath, JSON.stringify(updatedProducts), (err) => {
          if (err) {
            console.error(err);
          }
        });
      } else {
        this.id = nanoid();
        products.push(this);

        fs.writeFile(productsPath, JSON.stringify(products), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
    });
  }

  static deleteById(id) {
    getProducts((products) => {
      const product = products.find((product) => product.id === id);
      const updatedProducts = products.filter((product) => product.id !== id);

      fs.writeFile(productsPath, JSON.stringify(updatedProducts), (err) => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }
      });
    });
  }

  static fetchAll(callback) {
    getProducts(callback);
  }

  static findById(id, callback) {
    getProducts((products) => {
      const product = products.find((product) => product.id === id);
      callback(product);
    });
  }
};
