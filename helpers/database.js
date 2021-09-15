const { connect } = require("mongoose");

const mongooseConnect = (dbUri) => connect(dbUri);

module.exports = mongooseConnect;
