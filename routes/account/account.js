const router = require('express').Router();

const { promisifyReadFile } = require('../../lib/utils/promisifyReadFile.js');
const { jstNow } = require('../../lib/utils/jstNow.js');
const { authentication } = require('../../lib/security/authPassport');
const { createHashPassword } = require('../../lib/utils/hashPassword.js');
const mysqlAPI = require('../../lib/database/mysqlAPI');

// ユーザーのプロフィールURL更新処理
router.put('/user/photo_url', async (req, res, next) => {
  const bodyData = {
    photoUrl: req.body.photoUrl,
    id: req.body.userId,
  };
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/UPDATE_USERS_PROFILE_URL.sql`
    );
    await transaction.query(query, [bodyData.photoUrl, bodyData.id]);
    await transaction.commit();
    res.json({
      message:
        'ユーザープロフィール情報が更新されました。\n更新を反映するには再ログインお願いいたします。',
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

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

// 新規アカウント登録処理
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
    await transaction.commit();
    res.json({
      message:
        'アカウント登録に成功しました。\n登録処理を反映するには、一度ログイン認証をお願いします。',
    });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

// アカウント削除
router.delete('/', async (req, res, next) => {
  const bodyData = {
    id: req.body.userId,
  };
  let transaction;

  try {
    transaction = await mysqlAPI.beginTransaction();
    const query = await promisifyReadFile(
      `./lib/database/sql/users/DELETE_USERS_BY_ID.sql`
    );
    await transaction.query(query, [bodyData.id]);
    await transaction.commit();
    res.json({ message: 'アカウントが削除されました。' });
  } catch (err) {
    await transaction.rollback();
    next(err);
  }
});

module.exports = router;
