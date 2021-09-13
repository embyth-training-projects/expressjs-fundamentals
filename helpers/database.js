const { connect } = require("mongoose");

const mongooseConnect = (callback) =>
  connect(
    "mongodb+srv://rostyslav:Ru55FrCJFUqlWgfP@cluster0.jidn5.mongodb.net/shop-mongoose?retryWrites=true&w=majority"
  );

module.exports = mongooseConnect;
