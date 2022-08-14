const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const config = require("../../../config/application.config.js");
const mysqlAPI = require("../../database/mysqlAPI");
const { promisifyReadFile } = require("../../utils/promisifyReadFile");

function responseTokenLack(res) {
  return res.status(401).json({
    message: "アカウント認証ができませんでした。再度ログインをお願いします。",
  });
}

function createToken(payload) {
  const token = jwt.sign(payload, config.JWT_SECRET, config.jwtOptions);
  return token;
}

function authToken(req, res, next) {
  const encodeToken = req.cookies["token"];
  if (!encodeToken) {
    return responseTokenLack(res);
  }

  verifyToken(encodeToken, res, next);
}

function verifyToken(token, res, next) {
  try {
    const decodeToken = jwt.verify(token, config.JWT_SECRET);
    const { email, password } = decodeToken;

    //1. usersテーブルからemailを使って、該当ユーザーのidとpasswordのデータを取得。
    //2. decodeTokenから取得したpasswordとusersデータベースから取得したパスワードを比較
    (async () => {
      try {
        const query = await promisifyReadFile(
          "./lib/database/sql/users/SELECT_USERS_BY_EMAIL.sql"
        );
        const data = await mysqlAPI.query(query, [email]);
        if (!(await bcrypt.compare(password, data[0].password))) {
          return responseTokenLack(res);
        }
        res.locals.data = data;
        next();
      } catch (err) {
        return responseTokenLack(res);
      }
    })();
  } catch (err) {
    responseTokenLack(res);
  }
}

module.exports = {
  createToken,
  authToken,
};
