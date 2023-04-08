const { ApolloServer } = require("@apollo/server");

const gql = require("graphql-tag");

const { startStandaloneServer } = require("@apollo/server/standalone");

const connectDatabase = require("./src/config/db");

const { resolvers } = require("./src/graphql/resolvers/all_resolvers");

const JWT_SECRET = process.env.JWT_SECRET || "yoursupersercret";
const _ = require("lodash");

const jwt = require("jsonwebtoken");

// connects your databse
connectDatabase();

// Define schema
const typeDefs = gql`
  type Query {
    hello: String!
    user(id: ID!): User
    users: [User!]!
    employee(id: String!): Employee
    employees: [Employee!]!
  }

  type Mutation {
    createUser(
      username: String!
      email: String!
      password: String!
    ): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createEmployee(
      first_name: String!
      last_name: String!
      email: String!
    ): Employee
    updateEmployee(
      id: ID!
      first_name: String
      last_name: String
      email: String
    ): Employee

    deleteEmployee(id: ID): Employee
  }

  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Employee {
    id: ID!
    first_name: String!
    last_name: String!
    email: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }
`;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

startStandaloneServer(server, {
  context: (context) => {
    const authorization = context.req.headers.authorization || "";

    const token = authorization.replace("Bearer ", "");

    try {
      const { payload } = jwt.verify(token, JWT_SECRET);

      return { user: payload };
    } catch (err) {
      return { user: null };
    }
  },
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});

// const server = async (schema = genSchema) => new ApolloServer({
//   schema: await schema(),
//   context: ({ req }) => ({
//     req,
//     customHeaders: {
//       headers: {
//         ...req.headers,
//       },
//     },
//   }),
// });
