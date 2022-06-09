const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport");

router.get("/login/success", (req, res, next) => {
  // const data = {
  //   id: req.session.passport.user[0].userId,
  //   displayName: req.session.passport.user[0].displayName,
  //   photoUrl: req.session.passport.user[0].photoUrl,
  // };
  console.info(`req.user: ${req.flash("message")}`);
  res.json("aa");
});
router.get("/login/failure", (req, res, next) => {
  console.log("login/failure");
  // res.json(req.flash("message"));
  console.log(req.flash("message"));
});
router.post("/login", authentication());

module.exports = router;

// const { authenticate, callback } = require("../../lib/security/authGitHub.js");
// router.get("/github/callback", callback(), function (req, res) {
//   res.json(res.req.user);
// });
// router.get("/github/login", authenticate(), function (req, res) {});
// router.get("/github/logout", function (req, res, next) {
//   req.logout(function (err) {
//     if (err) {
//       return next(err);
//     }
//     res.redirect("/");
//   });
// });
