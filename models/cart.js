const fs = require("fs");

const utils = require("../helpers/utils");

const cartPath = utils.getCombinedPath("cart.json", "data");

module.exports = class Cart {
  static addProduct(id, price) {
    fs.readFile(cartPath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(fileContent);
      }

      const existingProductIndex = cart.products.findIndex(
        (product) => product.id === id
      );
      const existingProduct = cart.products.find(
        (product) => product.id === id
      );

      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [
          ...cart.products.slice(0, existingProductIndex),
          updatedProduct,
          ...cart.products.slice(existingProductIndex + 1),
        ];
      } else {
        updatedProduct = { id, qty: 1 };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +price;

      fs.writeFile(cartPath, JSON.stringify(cart), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  }

  static deleteProduct(id, price) {
    fs.readFile(cartPath, (err, fileContent) => {
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(fileContent) };
      const product = updatedCart.products.find((product) => product.id === id);

      if (!product) {
        return;
      }

      updatedCart.products = updatedCart.products.filter(
        (product) => product.id !== id
      );
      updatedCart.totalPrice = updatedCart.totalPrice - price * product.qty;

      fs.writeFile(cartPath, JSON.stringify(updatedCart), (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
  }

  static getCart(callback) {
    fs.readFile(cartPath, (err, fileContent) => {
      if (err) {
        callback(null);
      } else {
        const cart = JSON.parse(fileContent);
        callback(cart);
      }
    });
  }
};
