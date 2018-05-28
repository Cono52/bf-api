import { GraphQLSchema } from 'graphql';
import queryType from './queries/Article';

const ArticleSchema = new GraphQLSchema({
  query: queryType
});

export default ArticleSchema;
