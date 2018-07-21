import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const articleSchema = new mongoose.Schema({
  title: String,
  up_votes: Number,
  rank: Number,
  date: String,
  link: String,
}, { timestamps: true });


const Article = mongoose.model('articleSchema', articleSchema, 'articles');

Article.getArticles = limit => Article.find().sort({ rank: -1 }).limit(limit);

Article.isDuplicate = (id, callback) => {
  Article.find({ title: id }).distinct('title', callback);
};

Article.saveBatch = (articles) => {
  articles.forEach((article, i) => {
    Article.isDuplicate(article.title, (error, title) => {
      if (title.length < 1) {
        const dbArticle = new Article();
        dbArticle.title = article.title;
        dbArticle.date = article.date;
        dbArticle.link = article.link;
        dbArticle.up_votes = 1;
        dbArticle.save()
          .then((savedArticle) => {
            console.log(`Saved New ${i}: ${savedArticle.title}`);
          }).catch((err) => {
            console.log(err);
          });
      }

      // After saving last new article, re-rank all articles
      if (i === articles.length - 1) {
        Article.rankAll();
      }
    });
  });
};

Article.deleteOldest = (num = 1) => {
  Article.find({}).sort({ createdAt: 1 }).limit(num).exec()
    .then(arts => arts.map(art => art._id))
    .then(artIds => artIds.forEach(id => Article.findByIdAndRemove(id)
      .then((deletedArticle) => {
        console.log(`Delete item with title: ${deletedArticle.title}`);
      }).catch((err) => {
        console.log(err);
      })));
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

const rank = (article) => {
  const p = article.up_votes;
  const t = Math.floor((new Date() - new Date(article.createdAt)) / 3600e3);
  const g = 1.8; // The gravity

  return (p) / ((t + 2) ** g);
};

Article.rankAll = () => {
  console.time('Ranked articles');
  Article.find({}).sort({ createdAt: -1 }).exec()
    .then(arts => arts.forEach((art) => {
      art.rank = rank(art);
      art.save().catch(err => console.log(err));
    }));
  console.timeEnd('Ranked articles');
};

Article.getLatestBatch = () => Article.findOne().sort({ createdAt: -1 })
  .exec()
  .then(latestArticle => Article.find({ createdAt: { $gte: latestArticle.createdAt.setSeconds(0) } }).exec());

export default Article;
