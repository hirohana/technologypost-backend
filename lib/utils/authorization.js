/**
 * 認可処理を行うロジック。ログインしている状態ならnext()を呼び出し次のミドルウェアへ。
 * ログインしてない状態ならステータスコード403をクライアントへ渡す。
 * @returns {any}
 */
function authorization(privilege) {
  return function (req, res, next) {
    if (
      req.isAuthenticated() &&
      (req.user[0].permissions || []).indexOf(privilege) >= 0
    ) {
      next();
    } else {
      res.status(403).json("ログインしてない状態だと処理が出来ません。");
    }
  };
}

module.exports = { authorization };
