const router = require("express").Router();
const bcrypt = require("bcrypt");

const {
  promisifyReadFile,
} = require("../../../lib/utils/promisifyReadFile.js");
const mysqlAPI = require("../../../lib/database/mysqlAPI.js");
const { jstNow } = require("../../../lib/utils/jstNow.js");
const {
  dbSecurity,
  privilege,
  loginStatus,
} = require("../../../config/application.config.js");
const {
  setJwtToCookie,
} = require("../../../lib/security/jwt/setJwtToCookie.js");

function verifayEmailORPassword(res) {
  return res
    .status(401)
    .json({ message: "Emailまたはパスワードが間違っています。" });
}

function verifayAccountLock(res) {
  return res.status(401).json({
    message:
      "現在アカウントがロックされています。しばらくしたら再度ログイン認証をお試しください。",
  });
}

router.post("/", async (req, res, next) => {
  res.status();
  const { now, dateTime } = jstNow();
  const { email, password } = req.body;
  let transaction, query, data, lockStatus, loginFailureCount;

  try {
    transaction = await mysqlAPI.beginTransaction();
    // クエリ文をreadFileメソッドで読み込み
    query = await promisifyReadFile(
      "./lib/database/sql/users/SELECT_USERS_BY_EMAIL_FOR_UPDATE.sql"
    );

    // フォームから送られたemail情報に一致するユーザーがいるか探し、data変数に結果を代入
    data = await transaction.query(query, [email]);

    // フォームから送られたemail情報に一致するユーザーがいない場合の処理
    if (data.length !== 1) {
      transaction.commit();
      return verifayEmailORPassword(res);
    }

    // usersテーブルのロック状態を確認し、ロックされていればアカウントロック。
    // ロックされていなければ次の処理へ進む。
    query = await promisifyReadFile(
      "./lib/database/sql/users/SELECT_LOCKSTATUS_USERS_BY_USERID.sql"
    );

    lockStatus = await transaction.query(query, [data[0].id]);
    const lockTime = lockStatus[0].lock_status
      ? lockStatus[0].lock_status.getTime()
      : null;

    // 現在の時刻からロックされた時刻を引いた時間(単位ミリ秒)が、10分以上(60万ミリ秒)経過しているかどうかの判定。
    // 10分経っていなければアカウントロックのメッセージをクライアントに送信
    if (
      lockTime &&
      dateTime - lockTime < dbSecurity.ACCOUNT_LOCK_TIME * 60 * 1000
    ) {
      transaction.commit();
      return verifayAccountLock(res);
    }

    // ログイン履歴を削除(users_login_historyから)
    query = await promisifyReadFile(
      "./lib/database/sql/users_login_history/DELETE_USERS_LOGIN_HISTORY_BY_USERID.sql"
    );
    await transaction.query(query, [
      data[0].id,
      data[0].id,
      dbSecurity.MAX_LOGIN_HISTORY - 1,
    ]);

    // フォームから送られたpassword情報に一致するユーザーがいない場合の処理
    if (!(await bcrypt.compare(password, data[0].password))) {
      // パスワードが不一致だった場合、users_login_historyテーブルにログイン失敗履歴を作成
      query = await promisifyReadFile(
        "./lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql"
      );
      await transaction.query(query, [data[0].id, loginStatus.FAILURE, now]);

      // ログイン失敗回数(10分以内に失敗回数5回が閾値)を確認。閾値以上ならアカウントロック、
      // 閾値未満ならエラーメッセージを出力。
      query = await promisifyReadFile(
        "./lib/database/sql/users_login_history/SELECT_LOGIN_FAILURE_BY_USERID.sql"
      );
      const date = new Date(
        dateTime - dbSecurity.ACCOUNT_LOCK_TIME * 60 * 1000
      );
      loginFailureCount = await transaction.query(query, [
        data[0].id,
        date,
        loginStatus.FAILURE,
      ]);

      if (
        (loginFailureCount || [])[0].count >= dbSecurity.ACCOUNT_LOCK_THRESHOLD
      ) {
        // アカウントロック
        query = await promisifyReadFile(
          "./lib/database/sql/users/INSERT_USERS_LOCKSTATUS_BY_USERID.sql"
        );
        await transaction.query(query, [now, data[0].id]);
        await transaction.commit();
        return verifayAccountLock(res);
      } else {
        await transaction.commit();
        return verifayEmailORPassword(res);
      }
    }

    // パスワードが一致していた場合、users_login_tablesにログイン成功履歴を作成
    query = await promisifyReadFile(
      "./lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql"
    );
    await transaction.query(query, [data[0].id, loginStatus.SUCCESS, now]);

    // usersテーブルのlockStatusにnullを代入し、アカウントロックを解除
    query = await promisifyReadFile(
      "./lib/database/sql/users/UPDATE_USERS_LOCKSTATUS_NULL.sql"
    );
    await transaction.query(query);

    // jwtトークン作成、保存
    setJwtToCookie(email, password, res, req);

    // email、password共に一致したユーザーがいた場合に、req.userにその一致したユーザー情報を渡すためのデータ加工
    const user = [
      {
        userId: data[0].id,
        displayName: data[0].username,
        photoUrl: data[0].photo_url,
        permissions: [privilege.NORMAL],
      },
    ];
    res.status(200).json({ user, message: "ログイン処理に成功しました。" });
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
