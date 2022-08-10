const router = require("express").Router();

const {
  promisifyReadFile,
} = require("../../../lib/utils/promisifyReadFile.js");
const { jstNow } = require("../../../lib/utils/jstNow.js");
const { createHashPassword } = require("../../../lib/utils/hashPassword.js");
const mysqlAPI = require("../../../lib/database/mysqlAPI");
const {
  setJwtToCookie,
} = require("../../../lib/security/jwt/setJwtToCookie.js");

router.post("/", async (req, res, next) => {
  const { now } = jstNow();
  const hashPassword = await createHashPassword(req.body.password);
  const bodyData = {
    userName: req.body.userName,
    email: req.body.email,
    photoUrl: req.body.photoUrl,
    password: hashPassword,
    createdAt: now,
  };
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/INSERT_USERS_PROFILE_INFOMATION.sql`
    );

    await transaction.query(query, [
      bodyData.userName,
      bodyData.email,
      bodyData.password,
      bodyData.photoUrl,
      bodyData.createdAt,
    ]);

    // jwtトークン作成、保存
    setJwtToCookie(bodyData.email, bodyData.password, res);

    res.json({
      message:
        "アカウント登録に成功しました。\n登録処理を反映するには、一度ログイン認証をお願いします。",
    });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
