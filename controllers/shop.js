const Product = require("../models/product");
const Cart = require("../models/cart");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/catalog", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => console.error(err));
};

exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => console.error(err));
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findByPk(prodId)
    .then((product) => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.error(err));
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => cart.getProducts())
    .then((products) =>
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      })
    )
    .catch((err) => console.error(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  let fetchedCart;
  let quantity = 1;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: prodId } });
    })
    .then((products) => {
      const product = products.length > 0 && products[0];

      // If product already exist in cart -> increment quantity
      if (product) {
        quantity = product.cartItem.quantity + 1;
        return product;
      }

      // If product doesnt exist in cart -> find it by id from all products
      return Product.findByPk(prodId);
    })
    .then((product) =>
      fetchedCart.addProduct(product, {
        through: { quantity },
      })
    )
    .then(() => res.redirect("/cart"))
    .catch((err) => console.error(err));
};

exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .getCart()
    .then((cart) => cart.getProducts({ where: { id: prodId } }))
    .then((products) => products[0].cartItem.destroy())
    .then(() => res.redirect("/cart"))
    .catch((err) => console.error(err));
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders({ include: ["products"] })
    .then((orders) =>
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      })
    )
    .catch((err) => console.error(err));
};

exports.postOrder = (req, res, next) => {
  let fetchedCart;
  let cartProducts;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => (cartProducts = products))
    .then(() => req.user.createOrder())
    .then((order) =>
      order.addProducts(
        cartProducts.map((product) => {
          product.orderItem = { quantity: product.cartItem.quantity };
          return product;
        })
      )
    )
    .then(() => fetchedCart.setProducts(null))
    .then(() => res.redirect("/orders"))
    .catch((err) => console.error(err));
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    path: "/checkout",
    pageTitle: "Checkout",
  });
};
