const router = require("express").Router();
const { authentication } = require("../../lib/security/authPassport");

// ログイン認証が成功した際のリダイレクト先
router.get("/login/success", (req, res, next) => {
  res
    .status(200)
    .json({ user: req.user, message: "ログイン処理に成功しました。" });
});

// ログイン認証が失敗した際のリダイレクト先
router.get("/login/failure", (req, res, next) => {
  switch (req.flash("message")[0]) {
    case "Emailまたはパスワードが間違っています。":
      return res
        .status(401)
        .json({ message: "Emailまたはパスワードが間違っています。" });
    case "アカウントがロックされています。":
      return res.status(403).json({
        message: `現在アカウントがロックされています。\n 10分程経過した後に、ログイン認証をお試しください。`,
      });
    default:
      return res
        .status(500)
        .json({ message: "サーバ側にエラーが発生しています。" });
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
