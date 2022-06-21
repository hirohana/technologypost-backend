const mysql2 = require("mysql2");
const { promisify } = require("util");

const config = require("../../config/mysql.config");

const pool = mysql2.createPool({
  host: config.HOST,
  port: config.PORT,
  user: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE,
  connectionLimit: config.CONNECTION_LIMIT,
  queueLimit: config.QUEUE_LIMIT,
  timezone: "+09:00",
});

module.exports = {
  pool,
  promisifyGetConnection: promisify(pool.getConnection).bind(pool),
  promisifyQuery: promisify(pool.query).bind(pool),
};
