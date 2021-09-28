const { buildSchema } = require("graphql");

module.exports = buildSchema(`
  input UserSignupData {
    email: String!
    password: String!
    name: String!
  }

  input UserPostData {
    title: String!
    content: String!
    imageUrl: String!
  }

  type Post {
    _id: ID!
    title: String!
    content: String!
    imageUrl: String!
    creator: User!
    createdAt: String!
    updatedAt: String!
  }

  type User {
    _id: ID!
    name: String!
    email: String!
    password: String!
    status: String!
    posts: [Post!]!
  }

  type AuthData {
    token: String!
    userId: String!
  }

  type PostData {
    posts: [Post!]!
    totalPosts: Int!
  }

  type RootQuery {
    login(email: String!, password: String!): AuthData!
    status(userId: ID!): User!
    posts(page: Int): PostData!
    post(postId: ID!): Post!
  }

  type RootMutation {
    signup(signupData: UserSignupData): User!
    updateStatus(status: String!): User!
    deletePost(postId: ID!): Boolean
    createPost(postData: UserPostData): Post!
    updatePost(postId: ID!, postData: UserPostData): Post!
  }

  schema {
    query: RootQuery
    mutation: RootMutation
  }
`);
