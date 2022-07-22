const router = require('express').Router();
const mysqlAPI = require('../../../lib/database/mysqlAPI');
const { MAX_ITEMS_PER_PAGE } =
  require('../../../config/application.config.js').search;

// 検索keywordの個数に応じて動的にクエリを作成するため、バードコーディングで下記2つのSQLを記述。
const articlesByLikeSearchSQL = `
SELECT
  a.id AS article_id,
  a.title,
  a.letter_body,
  a.created_at,
  a.article_id_storage,
  a.file_names,
  a.images_url,
  u.id AS user_id,
  u.username,
  u.photo_url AS user_photo_url,
  GROUP_CONCAT(DISTINCT c.name) AS category_name,
  aco.comment,
  aco.created_at AS comment_created_at
FROM
  (SELECT * FROM articles WHERE public = 1 ORDER BY created_at DESC) AS a
  LEFT OUTER JOIN
    articles_category AS ac
  ON  a.id = ac.articles_id
    LEFT OUTER JOIN
      category AS c
    ON ac.category_id = c.id
      LEFT OUTER JOIN
        users AS u
      ON a.user_id = u.id
      LEFT OUTER JOIN
        articles_comments AS aco
      ON a.id = aco.articles_id
GROUP BY a.id
`;

const numberOfPagesByLikeSearch = `
SELECT
  count(*) AS totalPages
FROM
  (
    SELECT
      a.id,
      a.user_id,
      a.title,
      a.letter_body,
      u.username,
      GROUP_CONCAT(c.name) AS category_name
    FROM
      articles as a 
      LEFT OUTER JOIN
        articles_category AS ac
      ON a.id = ac.articles_id
        LEFT OUTER JOIN
          category AS c
        ON ac.category_id = c.id
          LEFT OUTER JOIN
            users AS u
            ON a.user_id = u.id
    WHERE a.public = 1
    GROUP BY a.id
`;

router.get('/', async (req, res, next) => {
  const keyword = req.query.keyword || '';
  const keywordArray = keyword.split(' ');
  const page = req.query.page || 1;
  let queryArticlesByLikeSearch = articlesByLikeSearchSQL;
  let parametaArticlesByLikeSearch = [];
  let queryNumberOfPagesByLikeSearch = numberOfPagesByLikeSearch;
  let parametaNumberOfPagesByLikeSearch = [];

  // クエリパラメータkeywordの引数に応じて、keywordの条件に合致したSQLクエリを作成
  for (let i = 0; i < keywordArray.length; i++) {
    if (i === 0) {
      queryArticlesByLikeSearch += `HAVING concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?\n`;
      const parameteQuery = keywordArray[i] ? `%${keywordArray[i]}%` : `%%`;
      parametaArticlesByLikeSearch.push(parameteQuery);
    } else {
      queryArticlesByLikeSearch += `AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?\n`;
      const parameteQuery = keywordArray[i] ? `%${keywordArray[i]}%` : `%%`;
      parametaArticlesByLikeSearch.push(parameteQuery);
    }
  }
  queryArticlesByLikeSearch += `ORDER BY a.created_at DESC \nLIMIT 6 OFFSET ?`;
  parametaArticlesByLikeSearch.push(
    page * MAX_ITEMS_PER_PAGE - MAX_ITEMS_PER_PAGE
  );

  // クエリパラメータpageの数値に応じて、keywordの条件に合致し、
  // 条件に合致した行の総数を取得するSQLクエリを作成。
  for (let i = 0; i < keywordArray.length; i++) {
    if (i === 0) {
      queryNumberOfPagesByLikeSearch += `HAVING concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ?`;
      const parameteQuery = keywordArray[i] ? `%${keywordArray[i]}%` : `%%`;
      parametaNumberOfPagesByLikeSearch.push(parameteQuery);
    } else {
      queryNumberOfPagesByLikeSearch += `AND concat(a.title, a.letter_body, u.username, IFNULL(category_name, "")) LIKE ? \n`;
      const parameteQuery = keywordArray[i] ? `%${keywordArray[i]}%` : `%%`;
      parametaNumberOfPagesByLikeSearch.push(parameteQuery);
    }
  }
  queryNumberOfPagesByLikeSearch += ` ORDER BY a.created_at DESC \n) as tmp`;

  // SQLを実行
  try {
    const data = await mysqlAPI.query(
      queryArticlesByLikeSearch,
      parametaArticlesByLikeSearch
    );
    const count = await mysqlAPI.query(
      queryNumberOfPagesByLikeSearch,
      parametaNumberOfPagesByLikeSearch
    );
    const paginationMaxCount = Math.ceil(
      count[0].totalPages / MAX_ITEMS_PER_PAGE
    );

    res.json({
      data,
      pagination: {
        totalPages: count[0].totalPages,
        paginationMaxCount,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
