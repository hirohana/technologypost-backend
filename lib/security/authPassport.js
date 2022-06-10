const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { promisifyReadFile } = require("../utils/promisifyReadFile.js");
const MySQLAPI = require("../database/mysqlAPI.js");
const PRIVILEGE = {
  NORMAL: "normal",
};

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
      const transaction = await MySQLAPI.beginTransaction();

      try {
        query = await promisifyReadFile(
          "./lib/database/sql/users/SELECT_USER_BY_EMAIL.sql"
        );
        data = await transaction.query(query, [email]);
      } catch (err) {
        done(err);
      }

      if (data.length === 0) {
        return done(
          null,
          false,
          req.flash("message", "Emailまたはパスワードが間違っています。")
        );
      }
      if (
        data.length !== 1 ||
        !(await bcrypt.compare(password, data[0].password))
      ) {
        return done(
          null,
          false,
          req.flash("message", "Emailまたはパスワードが間違っています。")
        );
      }

      const user = [
        {
          userId: data[0].userId,
          displayName: data[0].username,
          photoUrl: data[0].photoUrl,
          permissions: [PRIVILEGE.NORMAL],
        },
      ];

      req.session.regenerate((err) => {
        if (err) {
          done(err);
        } else {
          done(null, user);
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
  PRIVILEGE,
};
