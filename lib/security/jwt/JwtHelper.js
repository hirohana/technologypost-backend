const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const mysqlAPI = require("../../database/mysqlAPI");
const { promisifyReadFile } = require("../../utils/promisifyReadFile");
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

function createToken(payload) {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: 3600,
  });
  return token;
}

function authToken(req, res, next) {
  const encodeToken = req.cookies["token"];
  if (!encodeToken) {
    return res.status(401).json({ message: "ログイン認証をお願いします。" });
  }

  verifyToken(encodeToken, res, next);
}

function verifyToken(token, res, next) {
  try {
    const decodeToken = jwt.verify(token, JWT_SECRET);
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
          return res
            .status(401)
            .json({ message: "ログイン認証をお願いします。" });
        }
        res.locals.data = data;
        next();
      } catch (err) {
        return res
          .status(401)
          .json({ message: "ログイン認証をお願いします。" });
      }
    })();
  } catch (err) {
    res.status(401).json({ message: "ログイン認証をお願いします。" });
  }
}

module.exports = {
  createToken,
  authToken,
};
