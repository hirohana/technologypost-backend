const router = require('express').Router();
const mysqlAPI = require('../../../lib/database/mysqlAPI');
const {
  promisifyReadFile,
} = require('../../../lib/utils/promisifyReadFile.js');
const categoryURL = './lib/database/sql/category';

// カテゴリーデータベース(category)からカテゴリー一覧全て取得するAPI
router.get('/', async (req, res, next) => {
  try {
    const query = await promisifyReadFile(`${categoryURL}/SELECT_CATEGORY.sql`);
    const category = await mysqlAPI.query(query);
    res.json(category);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
