import { ApolloServer, gql, PubSub } from "apollo-server";

const usersData = [
  { id: "1", name: "ab", email: "cccc", age: 23 },
  { id: "2", name: "gf", email: "jjjj", age: 25 },
  { id: "3", name: "tt", email: "jdsadjjj", age: 25 }
];
const postsData = [
  { id: "1", title: "a", body: "aaa", author: "1" },
  { id: "2", title: "b", body: "bbb", author: "2" },
  { id: "3", title: "bdsadsa", body: "xxx", author: "2" },
  { id: "4", title: "xxxyyy", body: "uuuu", author: "3" }
];

const pubsub = new PubSub();

//Scalar type - String Boolean Int Float ID

//Type definitions Schema
const typeDefs = `
    type Query{
        users:[User]!
        posts:[Post]
        graces:[Int!]!
        greeting(name:String!):String!
    }
    type Mutation{
      createUser(data:CreateUserInput):User!
      deleteUser(id:ID!):User!
      updateUser(id:ID!,data:UpdateUser!):User!
    }

    type Subscription{
      count:Int!
      user(userId:ID):User
    }

    input UpdateUser{
      name:String
      email:String
      age:Int
    }

    input CreateUserInput{
      id:ID!
      name:String!
      email:String!
    }

    type User {
      id:ID!
      name:String!
      email:String!
      age:Int
      posts:[Post!]!
    }

    type Post{
      id:ID!
      title:String
      body:String
      author:User!
    }
`;
//Resolvers
const resolvers = {
  Query: {
    greeting: (parent, args, context, info) => {
      if (args.name) {
        return "Hello " + args.name;
      }
      return "Hello ";
    },

    posts: () => {
      return postsData;
    },
    graces: () => {
      return [1, 2, 3];
    },
    users: () => {
      return usersData;
    }
  },
  Mutation: {
    createUser: (parent, args, { pubsub }, info) => {
      pubsub.publish(`user ${args.data.id}`, {
        user: {
          id: "1",
          name: args.data.name,
          email: args.data.email
        }
      });
      return {
        id: args.data.id,
        name: args.data.name,
        email: args.data.email
      };
    },
    deleteUser: (parent, args, context, info) => {
      console.log(args);
    },
    updateUser: (parent, args, context, info) => {
      console.log(args.name);
    }
  },
  Subscription: {
    count: {
      subscribe: () => {
        let count = 0;
        setInterval(() => {
          count++;
          pubsub.publish("count", { count: 4 });
        }, 1000);
        return pubsub.asyncIterator("count");
      }
    },
    user: {
      subscribe: (parent, { userId }, ctx, info) => {
        return pubsub.asyncIterator(`user ${userId}`);
      }
    }
  },
  Post: {
    author: (parent, args, context, info) => {
      return usersData.find(user => {
        return user.id === parent.author;
      });
    }
  },
  User: {
    posts: (parent, args, context, info) => {
      return postsData.filter(post => {
        return post.author === parent.id;
      });
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: { pubsub }
});

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
