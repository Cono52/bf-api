import mongoose from "mongoose";

mongoose.Promise = global.Promise;

const ArticleSchema = new mongoose.Schema(
  {
    title: String,
    up_votes: Number,
    rank: Number,
    date: String,
    link: String
  },
  { timestamps: true }
);

ArticleSchema.statics.checkTitleExists = (id, callback) => {
  Article.find({ title: id }).distinct("title", callback);
};

ArticleSchema.statics.getArticles = limit =>
  Article.find()
    .sort({ rank: -1 })
    .limit(limit);

ArticleSchema.statics.saveBatch = batch => {
  batch.forEach((articleObject, i) => {
    Article.checkTitleExists(articleObject.title, (error, title) => {
      if (error) {
        throw error;
      }
      if (title.length < 1) {
        const dbArticle = new Article();
        dbArticle.title = articleObject.title;
        dbArticle.date = articleObject.date;
        dbArticle.link = articleObject.link;
        dbArticle.up_votes = 1;
        dbArticle
          .save()
          .then(savedArticle => {
            console.log(`Saved New ${i}: ${savedArticle.title}`);
          })
          .catch(err => {
            console.log(err);
          });
      }

      // After saving last new article, re-rank all articles
      if (i === batch.length - 1) {
        Article.rankAll();
      }
    });
  });
};

ArticleSchema.statics.deleteOldest = (num = 1) => {
  Article.find({})
    .sort({ createdAt: 1 })
    .limit(num)
    .exec()
    .then(arts => arts.map(art => art._id))
    .then(artIds =>
      artIds.forEach(id =>
        Article.findByIdAndRemove(id)
          .then(deletedArticle => {
            console.log(`Delete item with title: ${deletedArticle.title}`);
          })
          .catch(err => {
            console.log(err);
          })
      )
    );
};

// Article.addUpVotes = () => {
//   Article.find({}).exec()
//     .then(arts => arts.forEach((art) => {
//       art.up_votes = 1;
//       art.save((err) => {
//         if (err) {
//           console.log(err);
//         } else {
//           console.log('Added upvote to article', art._id);
//         }
//       });
//     }));
// };

const rank = article => {
  const p = article.up_votes;
  const t = Math.floor((new Date() - new Date(article.createdAt)) / 3600e3);
  const g = 1.8; // The gravity

  return p / (t + 2) ** g;
};

ArticleSchema.statics.rankAll = () => {
  console.time("Ranked articles");
  Article.find({})
    .sort({ createdAt: -1 })
    .exec()
    .then(arts =>
      arts.forEach(art => {
        art.rank = rank(art);
        art.save().catch(err => console.log(err));
      })
    );
  console.timeEnd("Ranked articles");
};

ArticleSchema.statics.getLatestBatch = () =>
  Article.findOne()
    .sort({ createdAt: -1 })
    .exec()
    .then(latestArticle => Article.find({ createdAt: { $gte: latestArticle.createdAt.setSeconds(0) } }).exec());

const Article = mongoose.model("ArticleSchema", ArticleSchema, "articles");

export default Article;
