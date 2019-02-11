import React, { Component } from "react";
import { WebSocketLink } from "apollo-link-ws";
import { HttpLink } from "apollo-link-http";
import { split } from "apollo-link";
import { getMainDefinition } from "apollo-utilities";
import { ApolloClient } from "apollo-client";
import { Subscription, ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import gql from "graphql-tag";
import "./App.css";

const wsLink = new WebSocketLink({
  uri: "ws://localhost:4000/graphql",
  options: {
    reconnect: true,
    connectionParams: () => {
      throw new Error("Aredos");
      // return {
      //   authentication: "NO"
      // };
    }
  }
});

const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql"
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === "OperationDefinition" && operation === "subscription";
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

const POST_SUBSCRIPTION = gql`
  subscription onPostAdded {
    postAdded {
      author
    }
  }
`;

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Subscription subscription={POST_SUBSCRIPTION}>
          {({ data, loading, error }) => {
            console.log(data);
            if (error) {
              console.error(error);
              return <div>Error</div>;
            }
            return (
              <div>
                New post by: {loading ? "Loading ..." : data.postAdded.author}
              </div>
            );
          }}
        </Subscription>
      </ApolloProvider>
    );
  }
}

export default App;
