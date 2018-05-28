import { GraphQLObjectType, GraphQLList } from 'graphql';
import Article from '../../models/Article';
import ArticleType from '../types/Article';

export default new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    articles: {
      type: new GraphQLList(ArticleType),
      resolve: () => {
        const articles = Article.find().limit(1000).exec();
        if (!articles) {
          throw new Error('Error');
        }
        return articles;
      }
    }
  })
});
