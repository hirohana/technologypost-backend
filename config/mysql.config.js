const HOST = process.env.MYSQL_HOST || "127.0.0.1";
const PORT = process.env.MYSQL_PORT || "3306";
const USERNAME = process.env.MYSQL_USERNAME || "admin";
const PASSWORD = process.env.MYSQL_PASSWORD || "hanatubure";
const DATABASE = process.env.MYSQL_DATABASE || "myportfolio";
const CONNECTION_LIMIT = process.env.MYSQL_CONNECTION_LIMIT
  ? parseInt(process.env.MYSQL_CONNECTION_LIMIT)
  : 10;
const QUEUE_LIMIT = process.env.MYSQL_QUEUE_LIMIT
  ? parseInt(process.env.MYSQL_QUEUE_LIMIT)
  : 0;

module.exports = {
  HOST,
  PORT,
  USERNAME,
  PASSWORD,
  DATABASE,
  CONNECTION_LIMIT,
  QUEUE_LIMIT,
};
