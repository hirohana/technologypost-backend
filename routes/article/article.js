const router = require("express").Router();
const mysqlAPI = require("../../lib/database/mysqlAPI");

const { PRIVILEGE } = require("../../lib/security/authPassport.js");
const { authorization } = require("../../lib/utils/authorization.js");
const { promisifyReadFile } = require("../../lib/utils/promisifyReadFile.js");

const databaseURL = "./lib/database/sql/article";

// 記事を全て取得するAPI
router.get("/", async (req, res, next) => {
  try {
    const queryString = await promisifyReadFile(
      `${databaseURL}/SELECT_ARTICLE.sql`
    );
    const results = await mysqlAPI.query(queryString);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// 認可処理が挟まれた(authorization(PRIVILEGE.NORMAL))、記事投稿API
router.post("/", authorization(PRIVILEGE.NORMAL), async (req, res, next) => {
  let transaction;
  const data = {
    userId: req.body.userId,
    title: req.body.title,
    letterBody: req.body.letterBody,
    createdAt: new Date(),
  };

  try {
    transaction = await mysqlAPI.beginTransaction();
    const queryString = await promisifyReadFile(
      `${databaseURL}/INSERT_ARTICLE.sql`
    );
    await transaction.query(queryString, [
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
