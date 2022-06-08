const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(
  "local-strategy",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {}
  )
);

function initialize() {
  return [passport.initialize(), passport.session()];
}

function authentication() {
  return passport.authenticate("local-strategy", {
    successRedirect: "/account",
    failureRedirect: "/account/login",
  });
}

function authorization() {}

module.exports = {
  initialize,
  authentication,
  authorization,
};
