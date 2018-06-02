import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import graphqlHTTP from 'express-graphql';

import ArticleSchema from './graphql/index';

import env from './envConfig';

import SiteEntry from './models/SiteEntry';
import Article from './models/Article';
import scrapeArticles from './scrapeArticles';

require('./auth/auth');

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

app.post('/register', passport.authenticate('register', { session: false }), async (req, res) => {
  res.json({
    message: 'Signup successful'
  });
});

app.post('/login', async (req, res) => {
  passport.authenticate('login', async (err, user, message) => {
    console.log(message);
    try {
      if (err || !user) {
        return res.json(401, message);
      }
      req.login(user, { session: false }, async (error) => {
        if (error) return res.json({ error });
        // We don't want to store the sensitive information such as the
        // user password in the token so we pick only the email and id
        const body = { _id: user._id, email: user.email };
        // Sign the JWT token and populate the payload with the user email and id
        const token = jwt.sign({ user: body }, 'top_secret');
        // Send back the token to the user
        return res.json({ token });
      });
    } catch (error) {
      return res.json(error);
    }
  })(req, res);
});

export default app;
