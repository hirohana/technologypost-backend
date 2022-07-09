const router = require('express').Router();
const mysqlAPI = require('../../../lib/database/mysqlAPI');
const {
  promisifyReadFile,
} = require('../../../lib/utils/promisifyReadFile.js');
const { MAX_ITEMS_PER_PAGE } =
  require('../../../config/application.config.js').search;
const articlesURL = './lib/database/sql/articles';

// ユーザーの公開記事をデータベース(articles)から作成日付順に取得するAPI
router.get('/:page/users/:id', async (req, res, next) => {
  const page = Number(req.params.page) || 1;
  const userId = Number(req.params.id);
  let query;

  try {
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_BY_USER_ID.sql`
    );
    const data = await mysqlAPI.query(query, [
      userId,
      MAX_ITEMS_PER_PAGE,
      page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE,
    ]);
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_TOTAL_NUMBER_OF_PAGES_BY_USER_ID.sql`
    );
    const count = await mysqlAPI.query(query, [userId]);
    const paginationMaxCount = Math.ceil(
      count[0].totalPages / MAX_ITEMS_PER_PAGE
    );
    res.json({
      data,
      pagination: { totalPages: count[0].totalPages, paginationMaxCount },
    });
  } catch (err) {
    next(err);
  }
});

// 1.投稿記事のデータベース(articles)から記事を作成日付順で取得。
// 2.投稿記事の総数を取得。
router.get('/:page', async (req, res, next) => {
  const page = Number(req.params.page) || 1;
  let query;
  try {
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_CREATE_DESC.sql`
    );
    const data = await mysqlAPI.query(query, [
      page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE,
    ]);
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_TOTAL_NUMBER_OF_PAGES.sql`
    );
    const count = await mysqlAPI.query(query);
    const paginationMaxCount = Math.ceil(
      count[0].totalPages / MAX_ITEMS_PER_PAGE
    );
    res.json({
      data,
      pagination: { totalPages: count[0].totalPages, paginationMaxCount },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
