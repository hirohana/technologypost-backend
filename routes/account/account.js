const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport");

// ログイン認証が成功した際のリダイレクト先
router.get("/login/success", (req, res, next) => {
  res.status(200).json(req.user);
});

// ログイン認証が失敗した際のリダイレクト先
router.get("/login/failure", (req, res, next) => {
  switch (req.flash("message")[0]) {
    case "Emailまたはパスワードが間違っています。":
      return res.status(401).json("Emailまたはパスワードが間違っています。");
    case "アカウントがロックされています。":
      return res.status(403).json("アカウントがロックされています。");
    default:
      return res.status(500).json("サーバ側にエラーが発生しています。");
  }
});

// ログイン認証処理(passportライブラリを使用)
router.post("/login", authentication());

// ログアウト処理
router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json("ログアウト処理に失敗しました。");
    }
    res.status(200).json("ログアウトしました。");
  });
});

module.exports = router;
