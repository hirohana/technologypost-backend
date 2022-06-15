const router = require("express").Router();
const mysqlAPI = require("../../lib/database/mysqlAPI");

const { jstNow } = require("../../lib/utils/jstNow.js");
const { privilege } = require("../../config/application.config.js");
const { authorization } = require("../../lib/utils/authorization.js");
const { promisifyReadFile } = require("../../lib/utils/promisifyReadFile.js");
const { MAX_ITEMS_PER_PAGE, MAX_ITEMS_WORDS } =
  require("../../config/application.config.js").search;

const articlesURL = "./lib/database/sql/articles";
const articles_commentsURL = "./lib/database/sql/articles_comments";

// クエリパラメータに指定された条件に合致した記事を取得するAPI
// クエリパラメータの値が指定されていなければ最新の記事から取得。
router.get("/search", async (req, res, next) => {
  const keyword = req.query.keyword || "";
  const keywordArray = keyword.split(" ");
  const page = req.query.page || 1;
  try {
    if (keywordArray.length <= MAX_ITEMS_WORDS) {
      const query = await promisifyReadFile(
        `${articlesURL}/SELECT_ARTICLES_BY_LIKE_SEARCH.sql`
      );
      const data = await mysqlAPI.query(query, [
        keywordArray[0] ? `%${keywordArray[0]}%` : `%%`,
        keywordArray[1] ? `%${keywordArray[1]}%` : `%%`,
        keywordArray[2] ? `%${keywordArray[2]}%` : `%%`,
        keywordArray[3] ? `%${keywordArray[3]}%` : `%%`,
        keywordArray[4] ? `%${keywordArray[4]}%` : `%%`,
        page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE,
      ]);
      res.json(data);
    } else if (keywordArray.length > MAX_ITEMS_WORDS) {
      res.status(403).json("検索欄に入力する単語は5個以内でお願いします。");
    } else {
      const query = await promisifyReadFile(
        `${articlesURL}/SELECT_ARTICLES_CREATE_DESC.sql`
      );
      const data = await mysqlAPI.query(query, [
        page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE,
      ]);
      res.json(data);
    }
  } catch (err) {
    next(err);
  }
});

// 1.投稿記事のデータベース(articles)から指定されたidの記事の詳細を表示。
// 2.上記投稿記事のIDをキーとして、article_commentsのデータベースから当該記事のコメントを取得。
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);
  try {
    const queries = await Promise.all([
      promisifyReadFile(`${articlesURL}/SELECT_ARTICLES_BY_ID.sql`),
      promisifyReadFile(
        `${articles_commentsURL}/SELECT_COMMENTS_BY_ARTICLES_ID.sql`
      ),
    ]);
    const result = await Promise.all([
      mysqlAPI.query(queries[0], [id, id]),
      mysqlAPI.query(queries[1], [id]),
    ]);
    const data = result[0][0];
    data.comments = result[1] || [];
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 投稿記事を日付順で取得するAPI
router.get("/", async (req, res, next) => {
  const page = req.query.page || 1;
  try {
    const query = await promisifyReadFile(
      `${articlesURL}/SELECT_ARTICLES_CREATE_DESC.sql`
    );
    const data = await mysqlAPI.query(query, [
      page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE,
    ]);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// 認可処理が挟まれた(authorization(PRIVILEGE.NORMAL))、記事投稿API
router.post("/", authorization(privilege.NORMAL), async (req, res, next) => {
  let transaction;
  const now = jstNow();
  const data = {
    userId: req.body.user_id,
    title: req.body.title,
    letterBody: req.body.letter_body,
    createdAt: now,
  };

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(`${articlesURL}/INSERT_ARTICLES.sql`);
    await transaction.query(query, [
      data.userId,
      data.title,
      data.letterBody,
      data.createdAt,
    ]);
    await transaction.commit();
    res.status(200).json(data);
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
