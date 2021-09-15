const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIdx = this.cart.items.findIndex(
    (cartProduct) => cartProduct.productId.toString() === product._id.toString()
  );

  if (cartProductIdx === -1) {
    // Add new cart item
    this.cart.items = [
      ...this.cart.items,
      { productId: product._id, quantity: 1 },
    ];
  } else {
    // Update quantity of existing one
    this.cart.items[cartProductIdx].quantity =
      this.cart.items[cartProductIdx].quantity + 1;
  }

  return this.save();
};

userSchema.methods.deleteCartItemById = function (productId) {
  const updatedCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };

  return this.save();
};

module.exports = model("User", userSchema);
