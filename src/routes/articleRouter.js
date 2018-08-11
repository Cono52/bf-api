import { Router } from "express";

import Article from "../models/Article";

const ArticleRouter = Router();

ArticleRouter.get("/getarticles", (req, res) => {
  Article.getArticles((err, articles) => {
    if (err) {
      throw err;
    }
    res.json(articles);
  }, parseInt(req.query.size, 10) || 10);
});

export default ArticleRouter;
