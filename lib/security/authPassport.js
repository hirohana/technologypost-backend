const passport = require("passport");
const { promisifyReadFile } = require("../utils/index.js");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const MySQLAPI = require("../database/mysqlAPI.js");

// passportを使用してユーザ情報をセッションに保存するシリアライズ
passport.serializeUser((user, done) => {
  done(null, user);
});
// passportを使用してIDからユーザー情報を特定し、req.userに格納するデシリアライズ。
passport.deserializeUser((obj, done) => {
  done(null, obj);
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
      const transaction = await MySQLAPI.beginTransaction();

      try {
        const query = await promisifyReadFile(
          "./lib/database/sql/users/SELECT_USER_BY_EMAIL.sql"
        );
        const data = await transaction.query(query, [email]);
        if (data.length === 0) {
          return done(
            null,
            false,
            req.flash("message", "Emailまたはパスワードが間違っています。")
          );
        }
        if (data.length !== 1 || data[0].password !== password) {
          return done(
            null,
            false,
            req.flash("message", "Emailまたはパスワードが間違っています。")
          );
        }

        const user = [
          {
            userId: data[0].user_id,
            displayName: data[0].username,
            photoUrl: data[0].photo_url,
          },
        ];
        done(null, user, req.flash(`message: こんにちは`));
        // req.session.regenerate((err) => {
        //   if (err) {
        //     done(err);
        //   } else {
        //   }
        // });
      } catch (err) {
        done(err);
      }
    }
  )
);

// middleware initialize passport
function initialize() {
  return [
    passport.initialize(),
    passport.session(),
    // function (req, res, next) {
    //   if (req.user) {
    //     res.locals.user = req.user;
    //   }
    //   next();
    // },
  ];
}
// passportによる認証方法の指定(local-strategy)及び認証が完了した後のリダイレクト先指定。
function authentication() {
  return passport.authenticate("local-strategy", {
    successRedirect: "/account/login/success",
    failureRedirect: "/account/login/failure",
  });
}

function authorization() {}

module.exports = {
  initialize,
  authentication,
  authorization,
};
