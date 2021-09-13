const { MongoClient } = require("mongodb");

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://rostyslav:Ru55FrCJFUqlWgfP@cluster0.jidn5.mongodb.net/shop?retryWrites=true&w=majority"
  )
    .then((client) => {
      console.log(`Connected to the database!`);
      _db = client.db();
      callback();
    })
    .catch((err) => console.error(err));
};

const getDatabase = () => {
  if (_db) {
    return _db;
  }

  throw new Error("No database was found!");
};

module.exports = { mongoConnect, getDatabase };
