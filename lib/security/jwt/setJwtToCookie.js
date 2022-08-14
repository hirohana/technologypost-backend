const { nowPlus1Hour } = require("../../utils/nowPlus1Hour");
const { createToken } = require("./JwtHelper");

/**
 * JWTトークンをCookieに保存する関数。認可処理を行うためのもの。
 * @param {string} email
 * @param {string} password
 * @param {*} res
 */
function setJwtToCookie(email, password, res, req) {
  const payload = {
    email,
    password,
  };
  const jwtToken = createToken(payload);
  // return jwtToken;

  // 今回デプロイ先のHerokuでは、HerokuのドメインがCookieを保存できない設定になっているので
  // 下記コードはコメントアウトにした。詳細については下記URL参照
  // https://devcenter.heroku.com/ja/articles/cookies-and-herokuapp-com
  const { time } = nowPlus1Hour();
  res.cookie("token", jwtToken, {
    httpOnly: true,
    expires: time,
  });
}

module.exports = {
  setJwtToCookie,
};
