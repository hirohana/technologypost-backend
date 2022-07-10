const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { promisifyReadFile } = require('../utils/promisifyReadFile.js');
const MySQLAPI = require('../database/mysqlAPI.js');
const { jstNow } = require('../../lib/utils/jstNow.js');
const {
  dbSecurity,
  privilege,
  loginStatus,
} = require('../../config/application.config.js');

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
  'local-strategy',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      let transaction, query, data, lockStatus, loginFailureCount;
      const { now, dateTime } = jstNow();
      try {
        transaction = await MySQLAPI.beginTransaction();
        // クエリ文をreadFileメソッドで読み込み
        query = await promisifyReadFile(
          './lib/database/sql/users/SELECT_USERS_BY_EMAIL_FOR_UPDATE.sql'
        );
        // フォームから送られたemail情報に一致するユーザーがいるか探し、data変数に結果を代入
        data = await transaction.query(query, [email]);
        // フォームから送られたemail情報に一致するユーザーがいない場合の処理
        if (data.length !== 1) {
          transaction.commit();
          return done(
            null,
            false,
            req.flash('message', 'Emailまたはパスワードが間違っています。')
          );
        }

        // usersテーブルのロック状態を確認し、ロックされていればアカウントロック。
        // ロックされていなければ次の処理へ進む。
        query = await promisifyReadFile(
          './lib/database/sql/users/SELECT_LOCKSTATUS_USERS_BY_USERID.sql'
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
          return done(
            null,
            false,
            req.flash(
              'message',
              `現在アカウントがロックされています。しばらくしたら再度ログイン認証をお試しください。`
            )
          );
        }

        // ログイン履歴を削除(users_login_historyから)
        query = await promisifyReadFile(
          './lib/database/sql/users_login_history/DELETE_USERS_LOGIN_HISTORY_BY_USERID.sql'
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
            './lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql'
          );
          await transaction.query(query, [
            data[0].id,
            loginStatus.FAILURE,
            now,
          ]);

          // ログイン失敗回数(10分以内に失敗回数5回が閾値)を確認。閾値以上ならアカウントロック、
          // 閾値未満ならエラーメッセージを出力。
          query = await promisifyReadFile(
            './lib/database/sql/users_login_history/SELECT_LOGIN_FAILURE_BY_USERID.sql'
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
            (loginFailureCount || [])[0].count >=
            dbSecurity.ACCOUNT_LOCK_THRESHOLD
          ) {
            // アカウントロック
            query = await promisifyReadFile(
              './lib/database/sql/users/INSERT_USERS_LOCKSTATUS_BY_USERID.sql'
            );
            await transaction.query(query, [now, data[0].id]);
            await transaction.commit();
            return done(
              null,
              false,
              req.flash(
                'message',
                `現在アカウントがロックされています。しばらくしたら再度ログイン認証をお試しください。`
              )
            );
          } else {
            await transaction.commit();
            return done(
              null,
              false,
              req.flash('message', 'Emailまたはパスワードが間違っています。')
            );
          }
        }

        // パスワードが一致していた場合、users_login_tablesにログイン成功履歴を作成
        query = await promisifyReadFile(
          './lib/database/sql/users_login_history/INSERT_USERS_LOGIN_HISTORY.sql'
        );
        await transaction.query(query, [data[0].id, loginStatus.SUCCESS, now]);

        // usersテーブルのlockStatusにnullを代入し、アカウントロックを解除
        query = await promisifyReadFile(
          './lib/database/sql/users/UPDATE_USERS_LOCKSTATUS_NULL.sql'
        );
        await transaction.query(query);
        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        return done(err);
      }

      // email、password共に一致したユーザーがいた場合に、req.userにその一致したユーザー情報を渡すためのデータ加工
      const user = [
        {
          userId: data[0].id,
          displayName: data[0].username,
          photoUrl: data[0].photo_url,
          permissions: [privilege.NORMAL],
        },
      ];

      // CSRF対策の為、ログイン認証後にセッション情報を再生成する
      req.session.regenerate((err) => {
        if (!err) {
          done(null, user);
        } else {
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
  return passport.authenticate('local-strategy', {
    successRedirect: '/api/v1/account/login/success',
    failureRedirect: '/api/v1/account/login/failure',
  });
}

module.exports = {
  initialize,
  authentication,
};
