const passport = require("passport");
const session = require("express-session");
const GitHubStrategy = require("passport-github2").Strategy;
const appConfig = require("../../config/application.config.js");

// initialize passport
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});
passport.use(
  new GitHubStrategy(
    {
      clientID: appConfig.GITHUB_CLIENT_ID,
      clientSecret: appConfig.GITHUB_CLIENT_SECRET,
      callbackURL: appConfig.CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

//express-session には、 セッションIDが作成されるときに利用される秘密鍵の文字列と、
//セッションを必ずストアに保存しない設定、セッションが初期化されてなくてもストアに
//保存しないという設定をそれぞれしてある。これはどちらも、セキュリティ強化のための設定
function initialize() {
  return [
    session({
      secret: "secret_key",
      resave: false,
      saveUninitialized: false,
    }),
    passport.initialize(),
    passport.session(),
  ];
}

function authenticate() {
  return passport.authenticate("github", { failureRedirect: "/login" });
}

function callback() {
  return passport.authenticate("github", { scope: ["user:email"] });
}

module.exports = {
  initialize,
  authenticate,
  callback,
};
