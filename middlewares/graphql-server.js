const { graphqlHTTP } = require("express-graphql");

const graphqlSchema = require("../graphql/schema");
const graphqlResolver = require("../graphql/resolvers");

module.exports = graphqlHTTP({
  schema: graphqlSchema,
  rootValue: graphqlResolver,
  graphiql: true,
  customFormatErrorFn(err) {
    if (!err.originalError) {
      return err;
    }

    const data = err.originalError.data;
    const message = err.message || "An error occured!";
    const statusCode = err.originalError.statusCode || 500;

    return { data, message, statusCode };
  },
});
