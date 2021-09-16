const { Schema, model } = require("mongoose");

const User = require("./user");

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

productSchema.pre("deleteOne", { document: false, query: true }, function () {
  // Calling Model.deleteOne({ name: 'test' }) returns query
  // Calling Model.findOne().then(doc => doc.deleteOne()) returns document
  const query = this.getQuery(); // returns query passed on Model.deleteOne(query) / exmpl: Product.deleteOne({ _id: productId, userId: req.user._id }) -> {_id: value, userId: value}

  return User.find({ "cart.items.productId": query._id })
    .then((users) =>
      users.map((user) => {
        const updatedCartItems = user.cart.items.filter(
          (item) => item.productId.toString() !== query._id
        );
        user.cart.items = updatedCartItems;
        return user.save();
      })
    )
    .catch((err) => console.error(err));
});

module.exports = model("Product", productSchema);
