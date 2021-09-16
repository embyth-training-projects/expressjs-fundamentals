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

productSchema.pre("deleteOne", function () {
  const productId = this.getQuery()["_id"];

  return User.find({ "cart.items.productId": productId })
    .then((users) =>
      users.map((user) => {
        const updatedCartItems = user.cart.items.filter(
          (item) => item.productId.toString() !== productId
        );
        user.cart.items = updatedCartItems;
        return user.save();
      })
    )
    .catch((err) => console.error(err));
});

module.exports = model("Product", productSchema);
