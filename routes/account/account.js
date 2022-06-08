const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport.js");

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
