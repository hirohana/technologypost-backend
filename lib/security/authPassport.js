const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { promisifyReadFile } = require("../utils/promisifyReadFile.js");
const MySQLAPI = require("../database/mysqlAPI.js");
const { jstNow } = require("../../lib/utils/jstNow.js");
const {
  dbSecurity,
  privilege,
  loginStatus,
} = require("../../config/application.config.js");

// passportを使用してユーザ情報をセッションに保存するシリアライズ
passport.serializeUser((user, done) => {
  done(null, user);
});
// passportを使用してIDからユーザー情報を特定し、req.userに格納するデシリアライズ。
passport.deserializeUser((user, done) => {
  done(null, user);
});

// passport認証方法の指定(local-strategy)、認証アルゴリズム(asyncコールバック関数以降)。
passport.use(
  "local-strategy",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let query, data;
      const now = jstNow();
      const transaction = await MySQLAPI.beginTransaction();

      try {
        // クエリ文をreadFileメソッドで読み込み
        query = await promisifyReadFile(
          "./lib/database/sql/users/SELECT_USER_BY_EMAIL.sql"
        );
        // フォームから送られたemail情報に一致するユーザーがいるか探し、data変数に結果を代入
        data = await transaction.query(query, [email]);

        // フォームから送られたemail情報に一致するユーザーがいない場合の処理
        if (data.length === 0) {
          return done(
            null,
            false,
            req.flash("message", "Emailまたはパスワードが間違っています。")
          );
        }

        // ログイン履歴を削除(users_login_historyから)
        query = await promisifyReadFile(
          "./lib/database/sql/users_login_history/DELETE_USERS_LOGIN_HISTORY_BY_USERID.sql"
        );
        await transaction.query(query, [
          data[0].id,
          dbSecurity.MAX_LOGIN_HISTORY - 1,
        ]);

        // フォームから送られたpassword情報に一致するユーザーがいない場合の処理
        if (
          data.length !== 1 ||
          !(await bcrypt.compare(password, data[0].password))
        ) {
          // パスワードが不一致だった場合、users_login_historyテーブルにログイン失敗履歴を作成
          query = await promisifyReadFile(
            "./lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql"
          );
          await transaction.query(query, [
            data[0].id,
            loginStatus.FAILURE,
            now,
          ]);

          await transaction.commit();
          return done(
            null,
            false,
            req.flash("message", "Emailまたはパスワードが間違っています。")
          );
        }

        // パスワードが一致していた場合、users_login_tablesにログイン成功履歴を作成
        query = await promisifyReadFile(
          "./lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql"
        );
        await transaction.query(query, [data[0].id, loginStatus.SUCCESS, now]);
      } catch (err) {
        await transaction.rollback();
        return done(err);
      }

      // email、password共に一致したユーザーがいた場合に、req.userにその一致したユーザー情報を渡すためのデータ加工
      const user = [
        {
          userId: data[0].userId,
          displayName: data[0].username,
          photoUrl: data[0].photoUrl,
          permissions: [privilege.NORMAL],
        },
      ];

      // CSRF対策の為、ログイン認証後にセッション情報を再生成する
      req.session.regenerate(async (err) => {
        if (!err) {
          await transaction.commit();
          done(null, user);
        } else {
          await transaction.rollback();
          done(err);
        }
      });
    }
  )
);

// middleware initialize passport
function initialize() {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    },
  ];
}

// passportによる認証方法の指定(local-strategy)及び認証が完了した後のリダイレクト先指定。
function authentication() {
  return passport.authenticate("local-strategy", {
    successRedirect: "/account/login/success",
    failureRedirect: "/account/login/failure",
  });
}

module.exports = {
  initialize,
  authentication,
};
