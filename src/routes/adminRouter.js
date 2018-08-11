import { Router } from "express";

import SiteEntry from "../models/SiteEntry";
import Article from "../models/Article";
import scrapeArticles from "../util/scrapeArticles";

const AdminRouter = Router();

AdminRouter.get("/getsites", (req, res) => {
  SiteEntry.getSiteEntries((err, siteEntries) => {
    if (err) {
      throw err;
    }
    res.json(siteEntries);
  });
});

AdminRouter.get("/aggregate", (req, res) => {
  SiteEntry.getSiteEntries((err, siteEntries) => {
    if (err) {
      throw err;
    }
    scrapeArticles(siteEntries)
      .then(articles => Article.saveBatch(articles))
      .then(() => Article.getLatestBatch())
      .then(latestBatch => {
        res.json(latestBatch);
      });
  });
});

AdminRouter.get("/deleteOldest", (req, res) => {
  Article.deleteOldest(parseInt(req.query.size, 10) || 1);
  res.json(`Deleted ${parseInt(req.query.size, 10) || 1} articles`);
});

export default AdminRouter;
