const router = require('express').Router();
const mysqlAPI = require('../../lib/database/mysqlAPI');
const { promisifyReadFile } = require('../../lib/utils/promisifyReadFile.js');
const { public_state } = require('../../config/application.config.js');

const articlesURL = './lib/database/sql/articles';
const articles_commentsURL = './lib/database/sql/articles_comments';
const articles_category = './lib/database/sql/articles_category';

// 1. 該当ユーザーの公開記事をデータベース(articles)から作成日付順に取得するAPI
// 2. 投稿記事のデータベース(articles)から記事を作成日付順で取得するAPIを記述。
router.use('/page', require('./page/page.js'));

// クエリパラメータに指定された条件に合致した記事を取得するAPI
// クエリパラメータの値が指定されていなければ最新の記事から取得。
router.use('/search', require('./search/search.js'));

// ユーザーの下書きデータに関するAPI
router.use('/draft', require('./draft/draft.js'));

// カテゴリーデータベース(category)からカテゴリー一覧全て取得するAPI
router.use('/category', require('./category/category.js'));

// 記事の状態(public)を公開(tinyintが1)、非公開(tinyintが0)に変更するAPI
router.put('/:id/:public', async (req, res, next) => {
  const id = Number(req.params.id);
  const publicState =
    req.params.public === 'true' ? public_state.true : public_state.false;
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `${articlesURL}/UPDATE_ARTICLES_COLUMN_OF_PUBLIC_BY_ID.sql`
    );
    await transaction.query(query, [publicState, id]);
    await transaction.commit();
    if (publicState === public_state.true) {
      res.json({ message: '日記が公開されました。' });
    } else {
      res.json({ message: '日記が非公開になりました。' });
    }
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// 1.投稿記事のデータベース(articles)から指定されたidの記事の詳細を表示。
// 2.上記投稿記事のIDをキーとして、article_commentsのデータベースから当該記事のコメントを取得。
router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  let query;
  try {
    query = await promisifyReadFile(`${articlesURL}/SELECT_ARTICLES_BY_ID.sql`);
    const data = await mysqlAPI.query(query, [id, id]);
    query = await promisifyReadFile(
      `${articles_commentsURL}/SELECT_COMMENTS_BY_ARTICLES_ID.sql`
    );
    const comments = await mysqlAPI.query(query, [id]);
    res.json({ data, comments });
  } catch (err) {
    next(err);
  }
});

// 記事データベース(articles)から該当記事を削除するAPI
router.delete('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  let query, transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    query = await promisifyReadFile(`${articlesURL}/DELETE_ARTICLES_BY_ID.sql`);
    await transaction.query(query, [id]);
    query = await promisifyReadFile(
      `${articles_category}/DELETE_ARTICLES_CATEGORY_BY_ARTICLE_ID.sql`
    );
    await transaction.query(query, [id]);
    await transaction.commit();
    res.json({ message: '記事が削除されました。' });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// 記事データベース(articles)から最新の記事IDを取得してからインクリメントを行い、そのIDを返すAPI
router.get('/', async (req, res, next) => {
  try {
    const query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_LATEST_ID.sql`
    );
    const data = await mysqlAPI.query(query);
    res.json({ id: ++data[0].id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
