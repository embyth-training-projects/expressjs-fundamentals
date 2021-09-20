const express = require("express");

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");
const productValidators = require("../middleware/product-validator");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  productValidators.addProduct,
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product/:productId => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  "/edit-product",
  productValidators.addProduct,
  isAuth,
  adminController.postEditProduct
);

// /admin/product/:productId => DELETE
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
