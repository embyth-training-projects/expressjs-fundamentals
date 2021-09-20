const path = require("path");
const fs = require("fs");

const { STRIPE_SECRET_KEY } = require("../helpers/const");

const PDFDocument = require("pdfkit");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/catalog", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProductDetails = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-details", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) =>
      user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }))
    )
    .then((products) =>
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => req.user.addToCart(product))
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.deleteCartProduct = (req, res, next) => {
  const prodId = req.body.productId;

  req.user
    .deleteCartItemById(prodId)
    .then(() => res.redirect("/cart"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) =>
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders,
      })
    )
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found!"));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized!"));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${invoiceName}"`);

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(24).text("Invoice", {
        underline: true,
      });
      pdfDoc.fontSize(16).text("-----");
      order.products.forEach((item) =>
        pdfDoc
          .fontSize(16)
          .text(
            `${item.product.title} - ${item.quantity} x $${item.product.price}`
          )
      );
      pdfDoc.fontSize(16).text("-----");
      pdfDoc
        .fontSize(16)
        .text(
          `Total Price: $${order.products.reduce(
            (acc, item) => acc + item.product.price,
            0
          )}`
        );
      pdfDoc.end();
    })
    .catch((err) => next(err));
};

exports.getCheckoutSuccess = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }));

      const order = new Order({
        products,
        user: {
          email: req.user.email,
          userId: req.user._id,
        },
      });

      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }));
      const totalPrice = products.reduce(
        (acc, item) => acc + item.product.price,
        0
      );

      return res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products,
        totalPrice,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCreateCheckoutSession = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((item) => ({
        quantity: item.quantity,
        product: { ...item.productId._doc },
      }));

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: products.map((item) => ({
          name: item.product.title,
          description: item.product.description,
          amount: item.product.price * 100,
          currency: "usd",
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      });
    })
    .then((session) => res.status(303).redirect(session.url))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
