import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import graphqlHTTP from "express-graphql";
import ArticleSchema from "./graphql/index";

import env from "../envConfig";

import { UserRouter, AdminRouter, ArticleRouter } from "./routes";

const app = express();

const corsOptions = {
  origin: env.ALLOWED_HOST
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("tiny"));

app.use(cors(corsOptions));

app.use(
  "/graphql",
  cors(),
  graphqlHTTP({
    schema: ArticleSchema,
    rootValue: global,
    graphiql: true
  })
);

app.use("/user", UserRouter);
app.use("/admin", AdminRouter);
app.use("/article", ArticleRouter);

export default app;
