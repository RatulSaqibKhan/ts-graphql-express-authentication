import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core"
import config from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const orm = await MikroORM.init(config);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get('/', (_, res) => {
    res.send("hello World");
  })
  app.listen(4000, () => {
    console.log("Server started on localhost:4000")
  })
}

main().catch(err => {
  console.error(err)
});