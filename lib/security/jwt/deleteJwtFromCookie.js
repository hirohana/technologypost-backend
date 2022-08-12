/**
 * CookieからJWTトークンを削除する関数
 * @param {*} res
 */

function deleteJwtFromCookie(res) {
  res.clearCookie("token");
}

module.exports = {
  deleteJwtFromCookie,
};
