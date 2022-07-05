const router = require('express').Router();
const mysqlAPI = require('../../../lib/database/mysqlAPI');
const {
  promisifyReadFile,
} = require('../../../lib/utils/promisifyReadFile.js');
const articlesURL = './lib/database/sql/articles';

const insertArticles_category = `
INSERT INTO
  articles_category(articles_id, category_id)
`;

router.post('/', async (req, res, next) => {
  let transaction, query;
  console.log(req.body);
  const data = {
    userId: req.body.user_id,
    title: req.body.title,
    letterBody: req.body.letter_body,
    createdAt: req.body.created_at,
    public: req.body.public,
  };
  const categories = req.body.category;

  try {
    transaction = await mysqlAPI.beginTransaction();
    query = await promisifyReadFile(
      `${articlesURL}/INSERT_ARTICLES_DRAFT_DATA.sql`
    );
    await transaction.query(query, [
      data.userId,
      data.title,
      data.letterBody,
      data.createdAt,
      data.public,
    ]);
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_LATEST_ID.sql`
    );
    const latestId = await transaction.query(query);

    let queryInsertArticlesCategory = insertArticles_category;
    let parametaArticlesCategory = [];
    for (let i = 0; i < categories.length; i++) {
      if (i === 0) {
        queryInsertArticlesCategory += `VALUES(?, ?)`;
        parametaArticlesCategory.push(latestId[0].id);
        parametaArticlesCategory.push(Number(categories[i].id));
      } else {
        queryInsertArticlesCategory += `, (?, ?)`;
        parametaArticlesCategory.push(latestId[0].id);
        parametaArticlesCategory.push(Number(categories[i].id));
      }
    }

    await transaction.query(
      queryInsertArticlesCategory,
      parametaArticlesCategory
    );
    await transaction.commit();
    res.status(200).end();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
