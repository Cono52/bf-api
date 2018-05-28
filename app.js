import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import graphqlHTTP from 'express-graphql';

import ArticleSchema from './graphql/index';

import env from './envConfig';

import SiteEntry from './models/SiteEntry';
import Article from './models/Article';
import scrapeArticles from './scrapeArticles';


const app = express();

const corsOptions = {
  origin: env.ALLOWED_HOST,
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors(corsOptions));

app.use('/graphql', cors(), graphqlHTTP({
  schema: ArticleSchema,
  rootValue: global,
  graphiql: true
}));


app.get('/getsites', (req, res) => {
  SiteEntry.getSiteEntries((err, siteEntries) => {
    if (err) {
      throw err;
    }
    res.json(siteEntries);
  });
});

app.get('/aggregate', (req, res) => {
  SiteEntry.getSiteEntries((err, siteEntries) => {
    if (err) {
      throw err;
    }
    scrapeArticles(siteEntries)
      .then(articles => Article.saveBatch(articles))
      .then(() => Article.getLatestBatch())
      .then((latestBatch) => {
        res.json(latestBatch);
      });
  });
});

app.get('/getarticles', (req, res) => {
  Article.getArticles((err, articles) => {
    res.json(articles);
  }, parseInt(req.query.size, 10) || 10);
});

app.get('/deleteOldest', (req, res) => {
  Article.deleteOldest(parseInt(req.query.size, 10) || 1);
  res.json(`Deleted ${parseInt(req.query.size, 10) || 1} articles`);
});

export default app;
