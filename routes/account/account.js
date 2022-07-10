const router = require('express').Router();

const { promisifyReadFile } = require('../../lib/utils/promisifyReadFile.js');
const { jstNow } = require('../../lib/utils/jstNow.js');
const { authentication } = require('../../lib/security/authPassport');
const { createHashPassword } = require('../../lib/utils/hashPassword.js');
const mysqlAPI = require('../../lib/database/mysqlAPI');

// ログイン認証が成功した際のリダイレクト先
router.get('/login/success', (req, res, next) => {
  res
    .status(200)
    .json({ user: req.user, message: 'ログイン処理に成功しました。' });
});

// ログイン認証が失敗した際のリダイレクト先
router.get('/login/failure', (req, res, next) => {
  switch (req.flash('message')[0]) {
    case 'Emailまたはパスワードが間違っています。':
      return res
        .status(401)
        .json({ message: 'Emailまたはパスワードが間違っています。' });
    case `現在アカウントがロックされています。しばらくしたら再度ログイン認証をお試しください。`:
      return res.status(403).json({
        message: `現在アカウントがロックされています。しばらくしたら再度ログイン認証をお試しください。`,
      });
    default:
      return res
        .status(500)
        .json({ message: 'サーバ側にエラーが発生しています。' });
  }
});

// ログイン認証処理(passportライブラリを使用)
router.post('/login', authentication());

// ログアウト処理
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json('ログアウト処理に失敗しました。');
    }
    res.status(200).json('ログアウトしました。');
  });
});

router.post('/signup', async (req, res, next) => {
  const { now } = jstNow();
  const hashPassword = await createHashPassword(req.body.password);
  const bodyData = {
    userName: req.body.userName,
    email: req.body.email,
    photoUrl: req.body.photoUrl,
    password: hashPassword,
    createdAt: now,
  };
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/INSERT_USERS_PROFILE_INFOMATION.sql`
    );

    await transaction.query(query, [
      bodyData.userName,
      bodyData.email,
      bodyData.password,
      bodyData.photoUrl,
      bodyData.createdAt,
    ]);
    transaction.commit();
    res.json({ message: 'アカウント登録に成功しました' });
  } catch (err) {
    transaction.rollback();
    next(err);
  }
});

module.exports = router;
