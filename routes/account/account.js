const router = require("express").Router();

const { promisifyReadFile } = require("../../lib/utils/promisifyReadFile.js");
const login = require("./login/login.js");
const signup = require("./signup/signup.js");
const mysqlAPI = require("../../lib/database/mysqlAPI");
const { authToken } = require("../../lib/security/jwt/JwtHelper.js");
const {
  deleteJwtFromCookie,
} = require("../../lib/security/jwt/deleteJwtFromCookie.js");

// ユーザーのプロフィールURL更新処理
router.put("/user/photo_url", authToken, async (req, res, next) => {
  const bodyData = {
    photoUrl: req.body.photoUrl,
    id: req.body.userId,
  };

  let transaction;
  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/UPDATE_USERS_PROFILE_URL.sql`
    );
    await transaction.query(query, [bodyData.photoUrl, bodyData.id]);
    await transaction.commit();
    res.json({
      message:
        "ユーザープロフィール情報が更新されました。\n更新を反映するには再ログインお願いいたします。",
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// ログイン認証処理
router.use("/login", login);

// 新規アカウント登録処理
router.use("/signup", signup);

// ログアウト処理
router.get("/logout", authToken, (req, res, next) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json("ログアウト処理に失敗しました。");
    }
    deleteJwtFromCookie(res);
    res.status(200).json("ログアウトしました。");
  });
});

// アカウント削除
router.delete("/", authToken, async (req, res, next) => {
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/DELETE_USERS_BY_ID.sql`
    );
    await transaction.query(query, [res.locals.data[0].id]);
    await transaction.commit();
    deleteJwtFromCookie(res);
    res.json({ message: "アカウントが削除されました。" });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
