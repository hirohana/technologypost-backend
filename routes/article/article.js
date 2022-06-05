const router = require("express").Router();
const mysqlAPI = require("../../lib/database/mysqlAPI");
const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile).bind(fs);
const databaseURL = "./lib/database/sql/article";

router.get("/", async (req, res, next) => {
  try {
    const queryString = await readFile(`${databaseURL}/SELECT_ARTICLE.sql`, {
      encoding: "utf-8",
    });
    const results = await mysqlAPI.query(queryString);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  let transaction;
  const data = {
    userId: req.body.userId,
    title: req.body.title,
    letterBody: req.body.letterBody,
    createdAt: new Date(),
  };

  try {
    transaction = await mysqlAPI.beginTransaction();
    const queryString = await readFile(`${databaseURL}/INSERT_ARTICLE.sql`, {
      encoding: "utf-8",
    });
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
