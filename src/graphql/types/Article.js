import { GraphQLObjectType, GraphQLString, GraphQLInt } from "graphql";

// User Type
const ArticleType = new GraphQLObjectType({
  name: "article",
  fields: () => ({
    title: {
      type: GraphQLString
    },
    link: {
      type: GraphQLString
    },
    up_votes: {
      type: GraphQLInt
    }
  })
});

export default ArticleType;
