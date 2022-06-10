const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport");

// ログイン認証が成功した際のリダイレクト先
router.get("/login/success", (req, res, next) => {
  res.json(req.user);
});

// ログイン認証が失敗した際のリダイレクト先
router.get("/login/failure", (req, res, next) => {
  res.json(req.flash("message"));
});

// ログイン認証処理(passportライブラリを使用)
router.post("/login", authentication());

// ログアウト処理
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      res.json("ログアウト処理に失敗しました。");
    }
    res.json("ログアウトしました。");
  });
});

module.exports = router;
