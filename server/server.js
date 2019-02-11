const { PubSub, gql, ApolloServer } = require("apollo-server");

const pubsub = new PubSub();

const typeDefs = gql`
  type Query {
    _empty: String
  }

  type Subscription {
    postAdded: Post!
  }

  type Post {
    author: String!
  }
`;

const POST_ADDED = "POST_ADDED";

const resolvers = {
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  }
};

setInterval(
  () => pubsub.publish(POST_ADDED, { postAdded: { author: "Author" } }),
  1000
);

const server = new ApolloServer({
  resolvers,
  typeDefs,
  subscriptions: {
    onConnect: connectionParams => {
      if (connectionParams.authentication !== "YES") {
        throw new Error("Invalid authentication");
      }
    }
  }
});

server.listen().then(({ subscriptionsUrl }) => {
  console.log("Subs ready: ", subscriptionsUrl);
});
