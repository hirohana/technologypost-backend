const router = require('express').Router();
const mysqlAPI = require('../../../lib/database/mysqlAPI');
const {
  promisifyReadFile,
} = require('../../../lib/utils/promisifyReadFile.js');

const articlesURL = './lib/database/sql/articles';
const articles_categoryURL = './lib/database/sql/articles_category';

// articles_categoryに下書きデータのカテゴリーをinsertする際に使用する動的SQL文
const insertArticles_categorySQL = `
INSERT INTO
  articles_category(articles_id, category_id)
`;

// ユーザーが下書きデータに登録した画像ファイルを削除した際に、記事データベース(articles)から、
// 関連するカラム(file_names、images_url)を更新するAPI
router.put('/image/:id', async (req, res, next) => {
  const articleId = Number(req.params.id);
  const bodyData = {
    fileNames: req.body.fileNames,
    images: req.body.images,
    letterBody: req.body.letterBody,
  };
  let transaction;
  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `${articlesURL}/UPDATE_ARTICLES_FILENAME_AND_IMAGES_URL_BY_ARTICLE_ID.sql`
    );
    await transaction.query(query, [
      bodyData.letterBody,
      bodyData.fileNames,
      bodyData.images,
      articleId,
    ]);
    transaction.commit();
    res.status(200).end();
  } catch (err) {
    transaction.rollback();
    next(err);
  }
});

// 1. 記事データベース(articles)で、URLパラメータから取得した記事IDを元に
//    ユーザーの下書き記事データを取得する
// 2. 記事データベース(articles)とカテゴリーテーブル(category)の中間テーブル(articles_category)に
//    URLパラメータから取得した記事IDを元に、登録されているカテゴリーIDを取得するAPI
router.get('/:id', async (req, res, next) => {
  if (req.params.id === 'undefined') {
    res.json({ message: '下書きデータが存在しません。' });
    return;
  }
  const articleId = Number(req.params.id);
  let query;

  try {
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_DRAFT_DATA_BY_ARTICLE_ID.sql`
    );
    const data = await mysqlAPI.query(query, [articleId]);
    query = await promisifyReadFile(
      `${articles_categoryURL}/SELECT_ARTICLES_CATEGORY_BY_ARTICLE_ID.sql`
    );
    const categories = await mysqlAPI.query(query, [articleId]);
    res.json({ data, categories });
  } catch (err) {
    next(err);
  }
});

// 記事データベース(articles)にある既存の下書き記事を上書きするAPI
router.put('/:id', async (req, res, next) => {
  const articleId = Number(req.params.id);
  const bodyData = {
    title: req.body.title,
    letterBody: req.body.letterBody,
    createdAt: req.body.createdAt,
    public: req.body.public,
    articleIdOfStorage: req.body.articleIdOfStorage,
    fileNames: req.body.fileNames,
    imagesUrl: req.body.imagesUrl,
  };
  let transaction;
  const categories = req.body.category;

  // 記事データベース(articles)の下書きデータを上書きする関数
  const updateArticles = async () => {
    const query = await promisifyReadFile(
      `${articlesURL}/UPDATE_ARTICLES_BY_ARTICLE_ID.sql`
    );
    await transaction.query(query, [
      bodyData.title,
      bodyData.letterBody,
      bodyData.createdAt,
      bodyData.public,
      bodyData.articleIdOfStorage,
      bodyData.fileNames,
      bodyData.imagesUrl,
      articleId,
    ]);
  };

  // articlesとcategoryの中間テーブルarticles_categoryにカテゴリーをinsertする関数
  // 動的SQL文を作っている。
  const updateArticlesCategory = async () => {
    let query;
    query = await promisifyReadFile(
      `${articles_categoryURL}/DELETE_ARTICLES_CATEGORY_BY_ARTICLE_ID.sql`
    );
    await transaction.query(query, [articleId]);

    let queryInsertArticlesCategory = insertArticles_categorySQL;
    let parametaArticlesCategory = [];
    for (let i = 0; i < categories.length; i++) {
      if (i === 0) {
        queryInsertArticlesCategory += `VALUES(?, ?)`;
        parametaArticlesCategory.push(articleId);
        parametaArticlesCategory.push(Number(categories[i].id));
      } else {
        queryInsertArticlesCategory += `, (?, ?)`;
        parametaArticlesCategory.push(articleId);
        parametaArticlesCategory.push(Number(categories[i].id));
      }
    }

    await transaction.query(
      queryInsertArticlesCategory,
      parametaArticlesCategory
    );
  };

  try {
    transaction = await mysqlAPI.beginTransaction();
    await Promise.all([updateArticles(), updateArticlesCategory()]);
    transaction.commit();
    res.status(200).json();
  } catch (err) {
    transaction.rollback();
    next(err);
  }
});

// 1.記事データベース(articles)に下書き記事を投稿。
// 2.記事データベース(articles)とカテゴリーテーブル(category)の中間テーブル(articles_category)に
// 記事IDとカテゴリーIDを投稿するAPI。動的にSQLクエリを作成するAPI。
router.post('/', async (req, res, next) => {
  let transaction, query;
  const data = {
    userId: req.body.userId,
    title: req.body.title,
    letterBody: req.body.letterBody,
    createdAt: req.body.createdAt,
    public: req.body.public,
    articleIdOfStorage: req.body.articleIdOfStorage,
    fileNames: req.body.fileNames,
    imagesUrl: req.body.imagesUrl,
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
      data.articleIdOfStorage,
      data.fileNames,
      data.imagesUrl,
    ]);
    query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_LATEST_ID.sql`
    );
    const latestId = await transaction.query(query);

    let queryInsertArticlesCategory = insertArticles_categorySQL;
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
